"""
Data Preprocessor - Handles all 3 sources
"""
import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Load and preprocess all 3 data sources"""
    
    def _load_cicids_like(self, folder: str, label_col: str = "Label") -> pd.DataFrame:
        """Load CICIDS/Network Intrusion format"""
        logger.info(f"Loading CICIDS-like data from {folder}")
        dfs = []
        
        folder_path = Path(folder)
        if not folder_path.exists():
            logger.warning(f"Folder not found: {folder}")
            return pd.DataFrame()
        
        for csv_file in folder_path.glob("*.csv"):
            try:
                df = pd.read_csv(csv_file, low_memory=False)
                df.columns = df.columns.str.strip()
                
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                if label_col in df.columns and label_col not in numeric_cols:
                    numeric_cols.append(label_col)
                
                df = df[numeric_cols].reset_index(drop=True)
                dfs.append(df)
                logger.info(f"  ✅ {csv_file.name}: {len(df)} rows")
            except Exception as e:
                logger.warning(f"  ❌ {csv_file.name}: {e}")
        
        if not dfs:
            return pd.DataFrame()
        
        combined = pd.concat(dfs, ignore_index=True)
        logger.info(f"  ✅ Combined: {len(combined)} rows")
        return combined
    
    def load_cicids(self, folder: str) -> pd.DataFrame:
        """Load CICIDS2017"""
        return self._load_cicids_like(folder, "Label")
    
    def load_network_intrusion(self, folder: str) -> pd.DataFrame:
        """Load Network Intrusion"""
        return self._load_cicids_like(folder, "Label")
    
    def load_unsw(self, folder: str) -> pd.DataFrame:
        """Load UNSW-NB15"""
        logger.info(f"Loading UNSW-NB15 from {folder}")
        dfs = []
        
        folder_path = Path(folder)
        if not folder_path.exists():
            logger.warning(f"Folder not found: {folder}")
            return pd.DataFrame()
        
        for csv_file in folder_path.glob("*.csv"):
            try:
                df = pd.read_csv(csv_file, encoding="cp1252", low_memory=False)
                df = df.loc[:, ~df.columns.duplicated()]
                df.columns = df.columns.str.strip()
                
                categorical_cols = ["proto", "service", "state", "attack_cat"]
                for col in categorical_cols:
                    if col in df.columns:
                        df[col] = pd.factorize(df[col])[0]
                
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                if "label" in df.columns and "label" not in numeric_cols:
                    numeric_cols.append("label")
                
                df = df[numeric_cols].reset_index(drop=True)
                dfs.append(df)
                logger.info(f"  ✅ {csv_file.name}: {len(df)} rows")
            except Exception as e:
                logger.warning(f"  ❌ {csv_file.name}: {e}")
        
        if not dfs:
            return pd.DataFrame()
        
        common_cols = set(dfs[0].columns)
        for d in dfs[1:]:
            common_cols &= set(d.columns)
        
        aligned = [d[list(common_cols)].reset_index(drop=True) for d in dfs]
        combined = pd.concat(aligned, ignore_index=True)
        logger.info(f"  ✅ Combined: {len(combined)} rows")
        return combined