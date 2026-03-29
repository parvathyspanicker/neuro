"""
Deep Learning CNN Model for MRI Analysis
Supports the trained brain tumor classifier (glioma, meningioma, notumor, pituitary).
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
import json
from typing import Dict, List, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MRICNNModel:
    """
    CNN model for MRI brain tumor classification.
    Supports 4-class classification: glioma, meningioma, notumor, pituitary.
    """

    def __init__(self, input_shape: Tuple[int, int, int] = (224, 224, 3),
                 num_classes: int = 4, model_path: Optional[str] = None):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model_path = model_path
        self.model = None

        # Default class names matching the trained model
        self.class_names = ['glioma', 'meningioma', 'notumor', 'pituitary']

        # Clinical display names
        self.display_names = {
            'glioma': 'Glioma (Primary Brain Tumor)',
            'meningioma': 'Meningioma',
            'notumor': 'Normal Brain Scan',
            'pituitary': 'Pituitary Adenoma',
        }

        # Detailed disease information
        self.disease_info = {
            'glioma': {
                'description': 'Primary brain tumor arising from glial cells, characterized by infiltrative growth pattern and potential for rapid progression',
                'clinical_findings': 'Abnormal mass lesion with irregular borders, potential edema, and mass effect on surrounding brain structures',
                'stages': ['Grade I (Benign)', 'Grade II (Low-grade)', 'Grade III (High-grade)', 'Grade IV (Glioblastoma)'],
                'brain_regions': ['Cerebral hemispheres', 'Brainstem', 'Cerebellum'],
                'severity': 'High',
                'treatment': ['Surgical resection', 'Radiation therapy', 'Chemotherapy', 'Targeted therapy'],
                'prognosis': 'Variable based on grade and molecular markers',
                'status': 'URGENT MEDICAL ATTENTION REQUIRED',
                'status_color': '#dc3545',
                'status_icon': '🚨',
            },
            'meningioma': {
                'description': 'Benign tumor arising from the meningeal layers covering the brain, typically slow-growing and well-circumscribed',
                'clinical_findings': 'Well-defined extra-axial mass with dural attachment, homogeneous enhancement, and potential mass effect',
                'stages': ['Grade I (Benign)', 'Grade II (Atypical)', 'Grade III (Anaplastic/Malignant)'],
                'brain_regions': ['Meninges', 'Skull base', 'Parasagittal region'],
                'severity': 'Low to Moderate',
                'treatment': ['Surgical resection', 'Radiation therapy', 'Observation'],
                'prognosis': 'Excellent for Grade I, variable for higher grades',
                'status': 'MEDICAL CONSULTATION RECOMMENDED',
                'status_color': '#17a2b8',
                'status_icon': 'ℹ️',
            },
            'notumor': {
                'description': 'Normal brain anatomy with no pathological findings detected. All brain structures appear within normal limits.',
                'clinical_findings': 'No evidence of mass lesions, hemorrhage, infarction, or other abnormalities',
                'stages': ['Normal'],
                'brain_regions': ['All regions normal'],
                'severity': 'None',
                'treatment': ['No treatment required', 'Regular follow-up as needed'],
                'prognosis': 'Excellent',
                'status': 'HEALTHY',
                'status_color': '#28a745',
                'status_icon': '✅',
            },
            'pituitary': {
                'description': 'Pituitary adenoma detected - a benign tumor of the pituitary gland that may affect hormone production and surrounding structures',
                'clinical_findings': 'Abnormal enhancement in the pituitary region with potential mass effect on surrounding structures',
                'stages': ['Microadenoma (<10mm)', 'Macroadenoma (≥10mm)', 'Invasive adenoma'],
                'brain_regions': ['Pituitary gland', 'Sella turcica', 'Optic chiasm'],
                'severity': 'Moderate',
                'treatment': ['Surgical resection', 'Medical therapy', 'Radiation therapy'],
                'prognosis': 'Good with appropriate treatment',
                'status': 'REQUIRES ATTENTION',
                'status_color': '#ffc107',
                'status_icon': '⚠️',
            },
        }

        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self.build_model()

    def build_model(self) -> keras.Model:
        """Build a simple CNN as fallback (primary usage loads pretrained model)."""
        logger.info("Building fallback CNN model...")
        inputs = keras.Input(shape=self.input_shape, name='mri_input')
        x = inputs
        for filters in [32, 64, 128]:
            x = keras.layers.Conv2D(filters, 3, activation='relu', padding='same')(x)
            x = keras.layers.BatchNormalization()(x)
            x = keras.layers.MaxPooling2D(2)(x)
            x = keras.layers.Dropout(0.25)(x)
        x = keras.layers.GlobalAveragePooling2D()(x)
        x = keras.layers.Dense(128, activation='relu')(x)
        x = keras.layers.Dropout(0.5)(x)
        outputs = keras.layers.Dense(self.num_classes, activation='softmax', name='predictions')(x)
        self.model = keras.Model(inputs, outputs, name='mri_cnn')
        self.model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy'],
        )
        return self.model

    def save_model(self, model_path: str) -> None:
        if self.model is None:
            raise ValueError("Model not built yet.")
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        if model_path.endswith('.h5'):
            model_path = model_path.replace('.h5', '.keras')
        self.model.save(model_path)
        info = {
            'class_names': self.class_names,
            'num_classes': self.num_classes,
            'input_shape': list(self.input_shape),
        }
        info_path = model_path.replace('.h5', '_info.json').replace('.keras', '_info.json')
        with open(info_path, 'w') as f:
            json.dump(info, f, indent=2)
        logger.info(f"Model saved to {model_path}")

    def load_model(self, model_path: str) -> None:
        try:
            if model_path.endswith('.h5') and not os.path.exists(model_path):
                keras_path = model_path.replace('.h5', '.keras')
                if os.path.exists(keras_path):
                    model_path = keras_path
            self.model = keras.models.load_model(model_path)
            info_path = model_path.replace('.h5', '_info.json').replace('.keras', '_info.json')
            if os.path.exists(info_path):
                with open(info_path, 'r') as f:
                    info = json.load(f)
                    self.class_names = info.get('class_names', self.class_names)
                    self.num_classes = info.get('num_classes', self.num_classes)
                    self.input_shape = tuple(info.get('input_shape', self.input_shape))
            logger.info(f"Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            logger.info("Building fallback model...")
            self.build_model()

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for inference (expects raw image, outputs batch-ready tensor)."""
        # Handle grayscale → RGB
        if len(image.shape) == 2:
            image = np.stack([image] * 3, axis=-1)
        elif len(image.shape) == 3 and image.shape[2] == 1:
            image = np.concatenate([image] * 3, axis=-1)
        elif len(image.shape) == 3 and image.shape[2] == 4:
            image = image[:, :, :3]  # RGBA → RGB

        # Resize to model input shape
        image = tf.image.resize(image, self.input_shape[:2])
        image = tf.cast(image, tf.float32)

        # Ensure pixel values are in [0, 255] range for the model
        if tf.reduce_max(image) <= 1.0:
            image = image * 255.0

        # Add batch dimension
        image = tf.expand_dims(image, axis=0)
        return image

    def predict(self, image: np.ndarray) -> Dict:
        """Make prediction on an MRI image."""
        if self.model is None:
            raise ValueError("Model not loaded.")

        processed = self.preprocess_image(image)
        predictions = self.model.predict(processed, verbose=0)

        top_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][top_idx])
        predicted_class = self.class_names[top_idx]
        display_name = self.display_names.get(predicted_class, predicted_class)
        info = self.disease_info.get(predicted_class, {})

        all_preds = sorted(
            [
                {
                    'class': self.display_names.get(cn, cn),
                    'confidence': float(predictions[0][i]),
                    'index': i,
                    'status': 'High Confidence' if float(predictions[0][i]) > 0.7
                              else 'Moderate' if float(predictions[0][i]) > 0.3
                              else 'Low Risk',
                }
                for i, cn in enumerate(self.class_names)
            ],
            key=lambda x: x['confidence'],
            reverse=True,
        )

        stage = self._determine_stage(predicted_class, confidence)
        recommendations = self._get_recommendations(predicted_class, confidence)

        return {
            'predicted_class': display_name,
            'confidence': confidence,
            'stage': stage,
            'status': info.get('status', 'UNDER REVIEW'),
            'status_color': info.get('status_color', '#6c757d'),
            'status_icon': info.get('status_icon', '🔍'),
            'disease_info': info,
            'all_predictions': all_preds,
            'recommendations': recommendations,
            'brain_regions_affected': info.get('brain_regions', []),
            'severity': info.get('severity', 'Unknown'),
            'treatment_options': info.get('treatment', []),
            'next_steps': self._get_next_steps(predicted_class),
            'patient_instructions': self._get_patient_instructions(predicted_class),
        }

    def _determine_stage(self, predicted_class: str, confidence: float) -> str:
        if predicted_class == 'notumor':
            return 'Normal'
        elif predicted_class == 'glioma':
            if confidence > 0.9:
                return 'Grade III-IV (High-grade)'
            elif confidence > 0.7:
                return 'Grade II-III (Intermediate)'
            else:
                return 'Grade I-II (Low-grade)'
        elif predicted_class == 'meningioma':
            if confidence > 0.85:
                return 'Grade I (Typical)'
            elif confidence > 0.6:
                return 'Grade I-II'
            else:
                return 'Grade II (Atypical)'
        elif predicted_class == 'pituitary':
            if confidence > 0.85:
                return 'Macroadenoma (≥10mm)'
            else:
                return 'Microadenoma (<10mm)'
        return 'Unknown'

    def _get_recommendations(self, predicted_class: str, confidence: float) -> List[str]:
        recs = []
        if confidence < 0.7:
            recs.append("Moderate confidence prediction. Additional imaging recommended for confirmation.")

        mapping = {
            'glioma': [
                'IMMEDIATE consultation with neurosurgeon and neuro-oncologist',
                'Urgent comprehensive MRI with contrast for staging',
                'Stereotactic biopsy for histopathological analysis',
                'Multidisciplinary tumor board discussion',
                'Genetic testing for personalized treatment approach',
            ],
            'meningioma': [
                'Consultation with neurosurgeon for evaluation',
                'Complete neurological and ophthalmological examination',
                'Consider surgical resection if symptomatic or growing',
                'Regular follow-up MRI imaging every 6-12 months',
                'Monitor for neurological symptoms or vision changes',
            ],
            'notumor': [
                'Continue routine health monitoring',
                'Maintain healthy lifestyle habits including regular exercise',
                'Schedule annual neurological examination',
                'Consider follow-up MRI in 2-3 years as per physician discretion',
            ],
            'pituitary': [
                'Urgent consultation with endocrinologist',
                'Comprehensive hormonal panel evaluation',
                'Visual field testing and ophthalmological assessment',
                'Consider MRI with contrast for detailed evaluation',
                'Discuss treatment options including transsphenoidal surgery',
            ],
        }
        recs.extend(mapping.get(predicted_class, ['Consult a neurologist for further evaluation']))
        return recs

    def _get_next_steps(self, predicted_class: str) -> List[str]:
        mapping = {
            'glioma': [
                'Schedule immediate neurosurgical consultation',
                'Arrange for comprehensive imaging studies',
                'Prepare for possible biopsy or surgical intervention',
                'Consider referral to specialized neuro-oncology center',
            ],
            'meningioma': [
                'Schedule neurosurgical consultation',
                'Complete comprehensive neurological examination',
                'Consider baseline neuropsychological testing',
                'Discuss treatment options and timing',
            ],
            'notumor': [
                'Continue current health regimen',
                'Schedule routine annual physical examination',
                'Maintain brain-healthy lifestyle choices',
            ],
            'pituitary': [
                'Schedule immediate endocrinologist consultation',
                'Complete comprehensive hormonal workup',
                'Arrange for visual field testing',
                'Consider neurosurgical consultation',
            ],
        }
        return mapping.get(predicted_class, [])

    def _get_patient_instructions(self, predicted_class: str) -> List[str]:
        mapping = {
            'glioma': [
                'Seek immediate medical attention if new neurological symptoms develop',
                'Do not delay any scheduled appointments',
                'Bring all imaging studies and medical records to consultations',
                'Consider bringing family member or caregiver to appointments',
            ],
            'meningioma': [
                'Monitor for new neurological symptoms or vision changes',
                'Keep scheduled follow-up appointments',
                'Maintain regular medical care',
                'Contact healthcare provider with any concerns',
            ],
            'notumor': [
                'No immediate medical intervention required',
                'Continue all current medications as prescribed',
                'Contact healthcare provider if any new neurological symptoms develop',
            ],
            'pituitary': [
                'Monitor for new symptoms including vision changes, headaches, or hormonal symptoms',
                'Do not delay follow-up appointments',
                'Bring all imaging studies to specialist consultations',
                'Maintain current medications unless instructed otherwise by physician',
            ],
        }
        return mapping.get(predicted_class, [])

    def get_model_summary(self) -> str:
        if self.model is None:
            return "Model not built yet."
        import io, sys
        old = sys.stdout
        sys.stdout = buf = io.StringIO()
        self.model.summary()
        sys.stdout = old
        return buf.getvalue()


def create_sample_model() -> MRICNNModel:
    return MRICNNModel()

def load_pretrained_model(model_path: str) -> MRICNNModel:
    return MRICNNModel(model_path=model_path)

if __name__ == "__main__":
    model = create_sample_model()
    print("Model created successfully!")
    print(f"Classes: {model.class_names}")
