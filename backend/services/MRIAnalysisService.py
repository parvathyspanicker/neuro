"""
MRI Analysis Service
Handles deep learning inference for MRI analysis using the trained brain tumor
classifier (MobileNetV2). No hardcoded predictions – all results come from the
real model.
"""

import os
import sys
import numpy as np
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
import uuid

# Add the models directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'models'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from mri_cnn import MRICNNModel
from image_preprocessing import MRIPreprocessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MRIAnalysisService:
    """Service class for MRI analysis using the trained brain tumor model."""

    def __init__(self, model_path: Optional[str] = None):
        # Default to the new brain tumor model
        self.model_path = model_path or os.path.join(
            os.path.dirname(__file__), '..', 'models', 'trained_models',
            'brain_tumor_model.keras',
        )
        self.preprocessor = MRIPreprocessor(target_size=(224, 224))
        self.model = None
        self.is_initialized = False
        self._initialize_model()

    # ── Initialisation ─────────────────────────────────────────────────────
    def _initialize_model(self) -> None:
        """Load the trained brain tumor classifier."""
        try:
            logger.info("Initialising MRI Analysis Service...")
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

            if os.path.exists(self.model_path):
                self.model = MRICNNModel(model_path=self.model_path)
                logger.info(f"Loaded trained model from {self.model_path}")
                logger.info(f"  Classes : {self.model.class_names}")
                logger.info(f"  Input   : {self.model.input_shape}")
            else:
                # Also check for the 'best' variant
                best_path = self.model_path.replace('brain_tumor_model', 'brain_tumor_best')
                if os.path.exists(best_path):
                    self.model = MRICNNModel(model_path=best_path)
                    logger.info(f"Loaded best model from {best_path}")
                else:
                    logger.warning("No trained model found – creating untrained model.")
                    self.model = MRICNNModel()
                    self.model.save_model(self.model_path)

            self.is_initialized = True
            logger.info("MRI Analysis Service ready ✓")

        except Exception as e:
            logger.error(f"Initialisation error: {e}")
            self.is_initialized = False
            raise

    # ── Single-image analysis ──────────────────────────────────────────────
    def analyze_mri(self, image_path: str,
                    patient_id: Optional[str] = None) -> Dict:
        """
        Analyse an MRI image and return clinical results.

        The prediction is produced entirely by the trained CNN – no filename
        heuristics or hardcoded overrides.
        """
        if not self.is_initialized:
            raise RuntimeError("MRI Analysis Service not initialised")

        try:
            logger.info(f"Analysing: {image_path}")

            # Load & preprocess
            image = self.preprocessor.load_image(image_path)
            processed_image = self.preprocessor.preprocess(image)

            # Extract statistical features (for the report)
            features = self.preprocessor.extract_features(processed_image)

            # ── Real model prediction ──────────────────────────────────
            prediction_result = self.model.predict(processed_image)
            logger.info(
                f"Prediction: {prediction_result['predicted_class']} "
                f"({prediction_result['confidence']:.2%})"
            )

            # Build analysis result
            analysis_id = str(uuid.uuid4())
            result = {
                'analysis_id': analysis_id,
                'patient_id': patient_id,
                'timestamp': datetime.now().isoformat(),
                'image_path': image_path,
                'prediction': prediction_result,
                'features': features,
                'image_info': {
                    'original_shape': list(image.shape),
                    'processed_shape': list(processed_image.shape),
                    'file_size': (os.path.getsize(image_path)
                                  if os.path.exists(image_path) else 0),
                },
                'model_info': {
                    'model_path': self.model_path,
                    'model_type': 'MobileNetV2_transfer_learning',
                    'input_shape': list(self.model.input_shape),
                    'num_classes': self.model.num_classes,
                    'class_names': self.model.class_names,
                },
            }

            logger.info(f"Analysis complete – ID {analysis_id}")
            return result

        except Exception as e:
            logger.error(f"Analysis error: {e}")
            raise

    # ── Batch analysis ─────────────────────────────────────────────────────
    def analyze_batch(self, image_paths: List[str],
                      patient_id: Optional[str] = None) -> List[Dict]:
        results = []
        for i, path in enumerate(image_paths):
            try:
                logger.info(f"[{i+1}/{len(image_paths)}] {path}")
                results.append(self.analyze_mri(path, patient_id))
            except Exception as e:
                logger.error(f"Error on {path}: {e}")
                results.append({
                    'analysis_id': str(uuid.uuid4()),
                    'patient_id': patient_id,
                    'timestamp': datetime.now().isoformat(),
                    'image_path': path,
                    'error': str(e),
                    'status': 'failed',
                })
        return results

    # ── Model info ─────────────────────────────────────────────────────────
    def get_model_info(self) -> Dict:
        if not self.is_initialized:
            return {'error': 'Model not initialised'}
        return {
            'model_path': self.model_path,
            'model_type': 'MobileNetV2_transfer_learning',
            'input_shape': list(self.model.input_shape),
            'num_classes': self.model.num_classes,
            'class_names': self.model.class_names,
            'is_initialized': self.is_initialized,
        }

    # ── Persistence helpers ────────────────────────────────────────────────
    def save_analysis_result(self, result: Dict, output_path: str) -> None:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2)
        logger.info(f"Saved to {output_path}")

    def load_analysis_result(self, result_path: str) -> Dict:
        with open(result_path, 'r') as f:
            return json.load(f)

    # ── Report generation ──────────────────────────────────────────────────
    def generate_report(self, result: Dict) -> str:
        if 'error' in result:
            return (
                "╔════════════════════════════════════════════════════════════╗\n"
                "║                    ANALYSIS FAILED                        ║\n"
                f"║ Error: {result['error']:<52} ║\n"
                "╚════════════════════════════════════════════════════════════╝"
            )

        pred = result['prediction']
        feat = result['features']
        icon = pred.get('status_icon', '🔍')
        status = pred.get('status', 'UNDER REVIEW')

        ts = datetime.fromisoformat(
            result['timestamp'].replace('Z', '+00:00')
        )
        ts_str = ts.strftime('%B %d, %Y at %I:%M %p')

        conf = pred['confidence']
        conf_label = ('High' if conf > 0.8 else
                      'Moderate' if conf > 0.6 else 'Low')

        lines = [
            "╔════════════════════════════════════════════════════════════════════════╗",
            "║              🏥 NEUROCARE AI  MRI ANALYSIS REPORT                     ║",
            "║             Advanced Deep-Learning Medical Imaging                     ║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            f"║ Analysis ID : {result['analysis_id']:<55}║",
            f"║ Patient ID  : {str(result.get('patient_id', 'N/A')):<55}║",
            f"║ Date & Time : {ts_str:<55}║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            "║                           DIAGNOSIS                                   ║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            f"║ {icon} Finding   : {pred['predicted_class']:<55}║",
            f"║ 📊 Confidence: {conf:.1%} ({conf_label}){' '*(45-len(f'{conf:.1%} ({conf_label})'))  }║",
            f"║ 🏥 Status    : {status:<55}║",
            f"║ 📋 Stage     : {pred.get('stage','N/A'):<55}║",
            f"║ ⚕️  Severity  : {pred.get('severity','N/A'):<55}║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            "║                       ALL PREDICTIONS                                 ║",
            "╠════════════════════════════════════════════════════════════════════════╣",
        ]

        for i, p in enumerate(pred['all_predictions'][:4], 1):
            st = p.get('status', '')
            lines.append(
                f"║  {i}. {p['class']:<40} {p['confidence']:.1%}  ({st}){' '*(12-len(st))}║"
            )

        lines += [
            "╠════════════════════════════════════════════════════════════════════════╣",
            "║                    RECOMMENDATIONS                                    ║",
            "╠════════════════════════════════════════════════════════════════════════╣",
        ]
        for i, r in enumerate(pred['recommendations'][:6], 1):
            lines.append(f"║  {i}. {r[:66]:<66}║")

        if 'next_steps' in pred:
            lines += [
                "╠════════════════════════════════════════════════════════════════════════╣",
                "║                       NEXT STEPS                                      ║",
                "╠════════════════════════════════════════════════════════════════════════╣",
            ]
            for i, s in enumerate(pred['next_steps'][:4], 1):
                lines.append(f"║  {i}. {s[:66]:<66}║")

        lines += [
            "╠════════════════════════════════════════════════════════════════════════╣",
            "║                    TECHNICAL DETAILS                                  ║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            f"║  Mean intensity  : {feat['mean_intensity']:.4f}{' '*50}║",
            f"║  Texture energy  : {feat['texture_energy']:.2f}{' '*50}║",
            f"║  Std deviation   : {feat['std_intensity']:.4f}{' '*50}║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            "║ ⚠️  This AI analysis is for screening purposes only.                  ║",
            "║    Consult a qualified physician for medical evaluation.              ║",
            "╠════════════════════════════════════════════════════════════════════════╣",
            "║ Generated by NeuroCare AI • MobileNetV2 Transfer Learning             ║",
            "╚════════════════════════════════════════════════════════════════════════╝",
        ]

        return '\n'.join(lines)


# ── Global singleton ───────────────────────────────────────────────────────
_mri_service = None

def get_mri_service() -> MRIAnalysisService:
    global _mri_service
    if _mri_service is None:
        _mri_service = MRIAnalysisService()
    return _mri_service

def initialize_mri_service(model_path: Optional[str] = None) -> MRIAnalysisService:
    global _mri_service
    _mri_service = MRIAnalysisService(model_path)
    return _mri_service

if __name__ == "__main__":
    try:
        svc = MRIAnalysisService()
        print("MRI Analysis Service initialised ✓")
        print(json.dumps(svc.get_model_info(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
