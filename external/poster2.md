# Machine Learning Model for the Prediction of Slow Vital Capacity

**Poster ID:** P203  
**Authors:** Samad Jahandideh¹, Albert A. Taylor¹, Amy Bian², Lisa Meng², Danielle Beaulieu¹, Mike Keymer¹, Jinsy Andrews², David L. Ennist¹  

¹ Origent Data Sciences, Inc., Vienna, VA, USA  
² Cytokinetics, Inc., South San Francisco, CA, USA

## Introduction

### Background

This report is the first step in a research collaboration that aims to retrospectively validate an ALS disease progression computer model using data from a clinical trial of the investigational drug tirasemtiv (BENEFIT-ALS). The PRO-ACT database is a rich source of Forced Vital Capacity (FVC) records, but contains relatively few Slow Vital Capacity (SVC) records. BENEFIT-ALS used SVC as an outcome, leading to the question of whether a reliable SVC predictive model could be developed using a training dataset rich in FVC records.

### Objective

Develop a model that predicts SVC using the PRO-ACT database.

## Methods

The PRO-ACT ALS database was used to compare three predictive models:

- Random Forest (RF)¹;
- Gradient Boosting Machine (GBM)²; and
- XGBoost³.

The XGBoost option was discarded because it exhibited both a higher root mean square deviation (RMSD) and a lower R² value than the other algorithms. Additional testing showed that the GBM model slightly outperformed the RF model.

Using the GBM algorithm, the study compared:

- predictions based on a 30-day run-in period with predictions made from baseline without a run-in period;
- the useful range of the model in terms of vital capacity and time; and
- model performance on an external dataset.

Finally, the study examined whether the model could generalize from FVC to SVC prediction.

### Training and validation

- Models were developed using baseline data from **N = 4,987** participants.
- Ten-fold cross-validation was applied to model training and testing.
- The external validation dataset included **60 participants** from trial **NCT01257581**. The dataset was provided courtesy of Dr. Nazem Atassi (Massachusetts General Hospital); participants were treated with creatine or tamoxifen.

## Results

A generalizable GBM-based predictive model was developed for Vital Capacity prediction. The longitudinal predictive model was validated using an external validation dataset.

### External validation

The poster reports the following observations:

- RMSD increases for extreme FVC values.
- RMSD increases with time.
- Higher RMSDs are correlated with sparser data.

### Generalizability of the FVC model to SVC prediction

The poster presents:

- **A:** the correlation between FVC and SVC values in 270 patients with both FVC and SVC records;
- **B:** application of the FVC model to prediction of SVC records.

### Performance comparison

The poster's model comparison concludes that:

1. XGBoost was discarded because it exhibited both a higher RMSD and a lower R² value than the other algorithms.
2. GBM slightly outperformed RF.

The original poster also contains graphical comparisons of the machine-learning models, the workflow of Vital Capacity prediction, external RMSD by FVC range and time interval, and external validation. The underlying plotted values are not available as machine-readable text in the PDF extraction.

## Conclusions

The study hypothesized that FVC records could be used to predict SVC scores for ALS patients with machine-learning techniques. The results support this hypothesis and showed acceptable correlation. GBM outperformed the other evaluated models, so it was selected as the core model for developing a tool to predict SVC.

## References

1. Breiman, L. (2001). Random Forests. *Machine Learning*, 45, 261–277.
2. Friedman, J. H. (2001). Greedy Function Approximation: A Gradient Boosting Machine. *The Annals of Statistics*, 29(5), 1189–1232.
3. Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. *arXiv*, 1603.02754.
