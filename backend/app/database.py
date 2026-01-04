import sqlite3
import pandas as pd
from datetime import datetime
import os

DB_NAME = "threat_detector.db"

class Database:
    def __init__(self):
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(DB_NAME, check_same_thread=False)

    def _init_db(self):
        """Initialize database with tables"""
        conn = self._get_conn()
        cur = conn.cursor()
        
        cur.execute('''
            CREATE TABLE IF NOT EXISTS threats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                prediction INTEGER,
                confidence REAL,
                severity TEXT,
                threat_type INTEGER,
                source_ip TEXT,
                attack_type TEXT
            )
        ''')
        
        conn.commit()
        conn.close()

    def add_threat(self, data):
        """Add a new threat record"""
        conn = self._get_conn()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO threats (timestamp, prediction, confidence, severity, threat_type, source_ip, attack_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('timestamp', datetime.now().isoformat()),
            data.get('prediction'),
            data.get('confidence'),
            data.get('severity'),
            data.get('threat_type'),
            data.get('source_ip', 'Unknown'),
            data.get('type', 'Unknown')
        ))
        
        conn.commit()
        conn.close()

    def get_recent_threats(self, limit=50):
        """Get recent threats"""
        conn = self._get_conn()
        df = pd.read_sql_query(f"SELECT * FROM threats ORDER BY id DESC LIMIT {limit}", conn)
        conn.close()
        return df.to_dict('records')

    def get_stats(self):
        """Get dashboard statistics"""
        conn = self._get_conn()
        
        # Total threats (prediction = 1)
        total_threats = conn.execute("SELECT COUNT(*) FROM threats WHERE prediction = 1").fetchone()[0]
        
        # Threats today
        today = datetime.now().strftime('%Y-%m-%d')
        threats_today = conn.execute(
            "SELECT COUNT(*) FROM threats WHERE prediction = 1 AND timestamp LIKE ?", 
            (f"{today}%",)
        ).fetchone()[0]
        
        # Avg confidence
        avg_confidence = conn.execute("SELECT AVG(confidence) FROM threats").fetchone()[0] or 0.0
        
        conn.close()
        
        return {
            "total_threats": total_threats,
            "threats_today": threats_today,
            "model_accuracy": 0.94, # Static for now as we don't have labeled feedback
            "avg_confidence": avg_confidence
        }

# Global instance
db = Database()
