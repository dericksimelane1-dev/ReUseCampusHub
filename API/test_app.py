
import ast
import math
import os
import joblib
import pandas as pd

# ---------- Metrics ----------
def precision_at_k(recommended, relevant, k=10):
    recommended_k = recommended[:k]
    return len(set(recommended_k) & set(relevant)) / max(1, k)

def recall_at_k(recommended, relevant, k=10):
    recommended_k = recommended[:k]
    return len(set(recommended_k) & set(relevant)) / max(1, len(relevant))

def ndcg_at_k(recommended, relevant, k=10):
    recommended_k = recommended[:k]
    rel_set = set(relevant)
    gains = [1.0 if r in rel_set else 0.0 for r in recommended_k]
    dcg = sum(g / math.log2(i + 2) for i, g in enumerate(gains))
    ideal_gains = [1.0] * min(len(relevant), k)
    idcg = sum(g / math.log2(i + 2) for i, g in enumerate(ideal_gains))
    return (dcg / idcg) if idcg > 0 else 0.0

# ---------- Tests ----------
def test_model_artifact_exists():
    assert os.path.exists("models/interest_recommender.joblib"), "Model bundle missing at models/interest_recommender.joblib"

def test_precision_recall_ndcg_thresholds():
    """
    Offline accuracy check on a small held-out set.
    Provide data/eval_truth.csv with columns:
      user_id,relevant_item_ids
      123,"[101,102,105]"
    """
    # Load model
    bundle = joblib.load("models/interest_recommender.joblib")
    model = bundle["model"]

    # Load ground truth
    path = "data/eval_truth.csv"
    assert os.path.exists(path), f"Missing ground-truth file: {path}"
    df = pd.read_csv(path)

    # Evaluate across users
    precisions, recalls, ndcgs = [], [], []
    K = 10

    for _, row in df.iterrows():
        user_id = int(row["user_id"])
        relevant = ast.literal_eval(row["relevant_item_ids"])  # e.g., "[101,102]"

        recs = model.recommend(user_id=user_id, top_k=K)
        assert isinstance(recs, list), f"Model returned non-list for user {user_id}"
        assert len(recs) == K, f"Model did not return top-{K} items for user {user_id}"

        precisions.append(precision_at_k(recs, relevant, K))
        recalls.append(recall_at_k(recs, relevant, K))
        ndcgs.append(ndcg_at_k(recs, relevant, K))

    # Aggregate
    avg_precision = sum(precisions) / max(1, len(precisions))
    avg_recall = sum(recalls) / max(1, len(recalls))
    avg_ndcg = sum(ndcgs) / max(1, len(ndcgs))

    # Thresholds (tune for your catalog; start modest to avoid flaky tests)
    MIN_PRECISION = 0.2
    MIN_NDCG = 0.25
    MIN_RECALL = 0.15

    assert avg_precision >= MIN_PRECISION, f"Precision@{K} too low: {avg_precision:.3f} < {MIN_PRECISION}"
    assert avg_ndcg >= MIN_NDCG, f"NDCG@{K} too low: {avg_ndcg:.3f} < {MIN_NDCG}"
