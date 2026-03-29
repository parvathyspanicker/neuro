# IV. RESULT AND DISCUSSION

The system was tested along technical and practical aspects to gauge its ability to classify brain tumors from MRI scans and monitor patient neurological health effectively.

## A. Performance Metrics

The system obtained an overall disease detection accuracy of **90.1%** using a MobileNetV2 transfer learning architecture. It demonstrated strong specific detection rates across the four classes, achieving high precision for **Glioma (95.4%)** and **Normal Brain Scans (94.3%)**, alongside excellent recall rates for **Pituitary Adenomas (98.7%)**. The average processing time per MRI scan was highly efficient: 0.5 seconds for image preprocessing (resizing to 224x224 and normalization), 1.1 seconds for inference, and 0.2 seconds for reporting. Confidence scoring was effectively categorized, with predictions above 70% flagged as "High Confidence", reducing diagnostic uncertainty. Efficiency in training was maximized through a two-phase approach; the custom classification head was trained for 15 epochs, followed by 25 epochs of fine-tuning the base model layers, utilizing early stopping and learning rate reduction strategies to avoid overfitting. 

## B. Comparative Analysis

The system decreased preliminary diagnosis time from hours under traditional radiologist waiting periods to just under 2 minutes, achieving a near instantaneous preliminary screening result. By accurately categorizing tumors into specific subtypes and severity grades (e.g., predicting tumor grading based on inference confidence bounds), the system greatly optimizes the diagnostic pipeline. It decreased overall diagnostic evaluation overhead and potentially lowers unnecessary testing costs, resulting in measurable operational savings for healthcare facilities. Efficiency of early intervention was enhanced significantly; by reliably flagging "High Confidence" results, patients requiring urgent attention (like aggressive gliomas) can be prioritized immediately over routine or benign findings. 

Overall, the system is much faster and highly efficient compared to traditional manual MRI analysis methods. It serves as a worthwhile, robust assistive tool for neurologists and radiologists in clinical environments.

> **Fig. 3. Training and Validation Accuracy of the Model**
![Training and Validation Accuracy](accuracy_graph.png)

> **Fig. 4. Comparison of Traditional Diagnosis vs NeuroCare System**
![Comparison of Traditional Diagnosis vs NeuroCare System](comparison_graph.png)

> **Fig. 5. Output Screenshot**
> *(Insert a screenshot of your MRI scanning results dashboard or Full Report screen here)*
