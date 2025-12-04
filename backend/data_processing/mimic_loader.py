import pandas as pd
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MIMICLoader:
    def __init__(self, data_dir="data/mimic"):
        self.data_dir = Path(data_dir)
        self.scaler = StandardScaler()
        self.label_encoders = {}
    
    def load_core_tables(self):
        logger.info("Loading core MIMIC CSV files...")
        patients = pd.read_csv(self.data_dir / "PATIENTS.csv")
        admissions = pd.read_csv(self.data_dir / "ADMISSIONS.csv")
        icustays = pd.read_csv(self.data_dir / "ICUSTAYS.csv")

        # Normalize column names to lowercase
        patients.columns = patients.columns.str.lower()
        admissions.columns = admissions.columns.str.lower()
        icustays.columns = icustays.columns.str.lower()

        logger.info(f"Loaded {len(patients)} patients, {len(admissions)} admissions, {len(icustays)} ICU stays")
        return patients, admissions, icustays
    
    def calculate_age(self, dob_series, reference_date):
        dob_year = pd.to_datetime(dob_series, errors='coerce').dt.year.fillna(1950)
        age = reference_date.year - dob_year
        return age.clip(lower=0, upper=120)

    def create_features(self, patients, admissions, icustays):
        logger.info("Creating features from core tables...")
        df = patients[['subject_id', 'gender', 'dob', 'dod_hosp']].copy()

        # Use earliest admission date as reference
        ref_date = pd.to_datetime(admissions['admittime'].dropna().min(), errors='coerce')
        if pd.isnull(ref_date):
            ref_date = pd.Timestamp('2020-01-01')

        df['age'] = self.calculate_age(df['dob'], ref_date)

        # Merge admissions info: admission_type, admission_location, discharge_location, insurance, length_of_stay
        admission_cols = ['subject_id', 'admission_type', 'admission_location', 'discharge_location', 'insurance', 'length_of_stay']
        admission_cols = [col for col in admission_cols if col in admissions.columns]
        df = df.merge(admissions[admission_cols], on='subject_id', how='left')

        # Aggregate ICU stays per subject
        icu_agg = icustays.groupby('subject_id').agg(
            num_icu_stays=('icustay_id', 'count'),
            first_careunit=('first_careunit', lambda x: x.mode().iloc[0] if not x.mode().empty else 'None'),
            last_careunit=('last_careunit', lambda x: x.mode().iloc[0] if not x.mode().empty else 'None')
        ).reset_index()

        df = df.merge(icu_agg, on='subject_id', how='left')

        # Fill missing numeric values
        df['num_icu_stays'] = df['num_icu_stays'].fillna(0)
        if 'length_of_stay' in df.columns:
            df['length_of_stay'] = pd.to_numeric(df['length_of_stay'], errors='coerce').fillna(0)
        else:
            df['length_of_stay'] = 0

        return df

    def encode_categorical(self, df):
        categorical_cols = ['gender', 'admission_type', 'admission_location', 'discharge_location', 'insurance', 'first_careunit', 'last_careunit']
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str).fillna('Unknown'))
                self.label_encoders[col] = le
        return df

    def prepare_ml_data(self, max_rows=1000):
        patients, admissions, icustays = self.load_core_tables()

        # Subsample for speed and memory
        patients_sample = patients.sample(n=min(len(patients), max_rows), random_state=42)
        subject_ids = patients_sample['subject_id'].unique()
        admissions_filtered = admissions[admissions['subject_id'].isin(subject_ids)]
        icustays_filtered = icustays[icustays['subject_id'].isin(subject_ids)]

        df = self.create_features(patients_sample, admissions_filtered, icustays_filtered)
        df = self.encode_categorical(df)

        features = ['age', 'length_of_stay', 'num_icu_stays']
        features += [col for col in ['gender', 'admission_type', 'admission_location', 'discharge_location', 'insurance', 'first_careunit', 'last_careunit'] if col in df.columns]

        X = df[features].fillna(0)
        X_scaled = pd.DataFrame(self.scaler.fit_transform(X), columns=X.columns, index=X.index)

        logger.info(f"ML dataset shape: {X_scaled.shape}")
        return X_scaled, df

    def save_processed_data(self, X, filepath="data/processed_mimic_for_ml.csv"):
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        X.to_csv(filepath)
        logger.info(f"Saved processed dataset to {filepath}")

if __name__ == "__main__":
    loader = MIMICLoader()
    X, df = loader.prepare_ml_data(max_rows=500)
    print(X.head())
    loader.save_processed_data(X)
