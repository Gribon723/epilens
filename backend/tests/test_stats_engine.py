import pytest
from app.services.stats_engine import (
    cluster_countries,
    compute_burden_index,
    compute_correlation,
    compute_trend,
    detect_anomalies,
)

# ---------------------------------------------------------------------------
# compute_trend
# ---------------------------------------------------------------------------

TREND_RECORDS = [
    {"year": 2000, "value": 10.0},
    {"year": 2001, "value": 12.0},
    {"year": 2002, "value": 14.0},
    {"year": 2003, "value": 16.0},
    {"year": 2004, "value": 18.0},
]


def test_trend_slope_is_positive():
    result = compute_trend(TREND_RECORDS)
    assert result["slope"] > 0
    assert result["trend_direction"] == "increasing"


def test_trend_r_squared_perfect_line():
    result = compute_trend(TREND_RECORDS)
    assert result["r_squared"] == pytest.approx(1.0, abs=1e-4)


def test_trend_projected_length():
    result = compute_trend(TREND_RECORDS, project_years=3)
    assert len(result["projected"]) == 3
    assert result["projected"][0]["year"] == 2005


def test_trend_trend_line_length_matches_input():
    result = compute_trend(TREND_RECORDS)
    assert len(result["trend_line"]) == len(TREND_RECORDS)


def test_trend_requires_two_points():
    with pytest.raises(ValueError, match="2 data points"):
        compute_trend([{"year": 2000, "value": 10.0}])


def test_trend_decreasing():
    records = [{"year": y, "value": 20.0 - y * 2} for y in range(5)]
    result = compute_trend(records)
    assert result["slope"] < 0
    assert result["trend_direction"] == "decreasing"


# ---------------------------------------------------------------------------
# compute_correlation
# ---------------------------------------------------------------------------

X_RECORDS = [
    {"country": "AFG", "year": 2000, "value": 10.0},
    {"country": "AGO", "year": 2000, "value": 20.0},
    {"country": "ALB", "year": 2000, "value": 30.0},
    {"country": "DZA", "year": 2000, "value": 40.0},
]

Y_RECORDS_POSITIVE = [
    {"country": "AFG", "year": 2000, "value": 5.0},
    {"country": "AGO", "year": 2000, "value": 10.0},
    {"country": "ALB", "year": 2000, "value": 15.0},
    {"country": "DZA", "year": 2000, "value": 20.0},
]

Y_RECORDS_NEGATIVE = [
    {"country": "AFG", "year": 2000, "value": 40.0},
    {"country": "AGO", "year": 2000, "value": 30.0},
    {"country": "ALB", "year": 2000, "value": 20.0},
    {"country": "DZA", "year": 2000, "value": 10.0},
]


def test_correlation_perfect_positive():
    result = compute_correlation(X_RECORDS, Y_RECORDS_POSITIVE)
    assert result["pearson_r"] == pytest.approx(1.0, abs=1e-4)
    assert result["spearman_r"] == pytest.approx(1.0, abs=1e-4)


def test_correlation_perfect_negative():
    result = compute_correlation(X_RECORDS, Y_RECORDS_NEGATIVE)
    assert result["pearson_r"] == pytest.approx(-1.0, abs=1e-4)


def test_correlation_scatter_points_count():
    result = compute_correlation(X_RECORDS, Y_RECORDS_POSITIVE)
    assert result["n"] == 4
    assert len(result["scatter_points"]) == 4


def test_correlation_unmatched_rows_dropped():
    # 4 x-records, only 3 matching y-records — merged result should have n=3
    y_partial = Y_RECORDS_POSITIVE[:3]
    result = compute_correlation(X_RECORDS, y_partial)
    assert result["n"] == 3


def test_correlation_requires_three_pairs():
    with pytest.raises(ValueError, match="3 matched"):
        compute_correlation(X_RECORDS[:2], Y_RECORDS_POSITIVE[:2])


# ---------------------------------------------------------------------------
# compute_burden_index
# ---------------------------------------------------------------------------

BURDEN_RECORDS = [
    {"country": "AFG", "indicator": "MORT", "value": 80.0},
    {"country": "AFG", "indicator": "LIFE", "value": 55.0},
    {"country": "AGO", "indicator": "MORT", "value": 40.0},
    {"country": "AGO", "indicator": "LIFE", "value": 65.0},
    {"country": "ALB", "indicator": "MORT", "value": 10.0},
    {"country": "ALB", "indicator": "LIFE", "value": 75.0},
]


def test_burden_returns_all_countries():
    result = compute_burden_index(BURDEN_RECORDS)
    countries = {r["country"] for r in result}
    assert countries == {"AFG", "AGO", "ALB"}


def test_burden_rank_field_present():
    result = compute_burden_index(BURDEN_RECORDS)
    ranks = sorted(r["rank"] for r in result)
    assert ranks == [1, 2, 3]


def test_burden_invert_flips_ranking():
    # MORT = bad when high, LIFE = good when high
    result_no_invert = compute_burden_index(BURDEN_RECORDS)
    result_invert = compute_burden_index(BURDEN_RECORDS, invert=["MORT"])
    # With MORT inverted, AFG (highest MORT) should rank lower
    no_inv_afg = next(r for r in result_no_invert if r["country"] == "AFG")
    inv_afg = next(r for r in result_invert if r["country"] == "AFG")
    assert inv_afg["score"] < no_inv_afg["score"]


def test_burden_scores_between_zero_and_one():
    result = compute_burden_index(BURDEN_RECORDS)
    for r in result:
        assert 0.0 <= r["score"] <= 1.0


# ---------------------------------------------------------------------------
# detect_anomalies
# ---------------------------------------------------------------------------

# Alternating ±0.5 around 50 — symmetric so no value can exceed 2 std
NORMAL_SERIES = [
    {"year": 2000 + i, "value": 50.5 if i % 2 == 0 else 49.5}
    for i in range(10)
]
ANOMALY_SERIES = NORMAL_SERIES + [{"year": 2010, "value": 200.0}]


def test_anomalies_no_anomalies_in_smooth_series():
    result = detect_anomalies(NORMAL_SERIES)
    assert result["anomalies"] == []


def test_anomalies_detects_spike():
    result = detect_anomalies(ANOMALY_SERIES)
    assert len(result["anomalies"]) >= 1
    flagged_years = {a["year"] for a in result["anomalies"]}
    assert 2010 in flagged_years


def test_anomalies_series_length_matches_input():
    result = detect_anomalies(ANOMALY_SERIES)
    assert len(result["series"]) == len(ANOMALY_SERIES)


def test_anomalies_requires_three_points():
    with pytest.raises(ValueError, match="3 data points"):
        detect_anomalies([{"year": 2000, "value": 10.0}, {"year": 2001, "value": 11.0}])


# ---------------------------------------------------------------------------
# cluster_countries
# ---------------------------------------------------------------------------

CLUSTER_RECORDS = []
for country, base in [("AFG", 80), ("AGO", 60), ("ALB", 40), ("DZA", 20), ("EGY", 70), ("ETH", 50)]:
    for i in range(5):
        CLUSTER_RECORDS.append({"country": country, "year": 2000 + i, "value": base + i * 0.5})


def test_cluster_returns_all_countries():
    result = cluster_countries(CLUSTER_RECORDS, n_clusters=3)
    countries = {r["country"] for r in result}
    assert countries == {"AFG", "AGO", "ALB", "DZA", "EGY", "ETH"}


def test_cluster_label_count():
    result = cluster_countries(CLUSTER_RECORDS, n_clusters=3)
    labels = {r["cluster"] for r in result}
    assert len(labels) == 3


def test_cluster_features_present():
    result = cluster_countries(CLUSTER_RECORDS, n_clusters=2)
    for r in result:
        assert "mean_value" in r
        assert "trend_slope" in r
        assert "std_dev" in r


def test_cluster_requires_enough_countries():
    tiny = [{"country": "AFG", "year": 2000, "value": 10.0}]
    with pytest.raises(ValueError, match="at least"):
        cluster_countries(tiny, n_clusters=3)
