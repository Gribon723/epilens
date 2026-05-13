import numpy as np
import pandas as pd
from scipy.stats import linregress, pearsonr, spearmanr
from sklearn.cluster import KMeans
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler


def compute_trend(records: list[dict], project_years: int = 5) -> dict:
    """
    Fit a linear trend to a {year, value} time series.

    Returns slope, intercept, r_squared, p_value, trend_direction,
    trend_line (fitted values per observed year), and projected
    (fitted values for the next project_years years).
    """
    if len(records) < 2:
        raise ValueError("At least 2 data points are required for trend analysis")

    df = pd.DataFrame(records).dropna(subset=["value"]).sort_values("year")
    years = df["year"].astype(float).to_numpy()
    values = df["value"].astype(float).to_numpy()

    slope, intercept, r, p_value, _ = linregress(years, values)

    if abs(slope) < 1e-6 or p_value > 0.05:
        direction = "stable"
    elif slope > 0:
        direction = "increasing"
    else:
        direction = "decreasing"

    last_year = int(years[-1])
    future_years = list(range(last_year + 1, last_year + project_years + 1))

    return {
        "slope": round(float(slope), 6),
        "intercept": round(float(intercept), 6),
        "r_squared": round(float(r ** 2), 4),
        "p_value": round(float(p_value), 6),
        "trend_direction": direction,
        "trend_line": [
            {"year": int(y), "value": round(float(intercept + slope * y), 4)}
            for y in years
        ],
        "projected": [
            {"year": y, "value": round(float(intercept + slope * y), 4)}
            for y in future_years
        ],
    }


def compute_correlation(x_records: list[dict], y_records: list[dict]) -> dict:
    """
    Compute Pearson and Spearman correlation between two indicators.

    x_records and y_records are lists of {country, year, value}.
    Records are matched on (country, year); unmatched rows are dropped.
    """
    x_df = pd.DataFrame(x_records)[["country", "year", "value"]].rename(columns={"value": "x"})
    y_df = pd.DataFrame(y_records)[["country", "year", "value"]].rename(columns={"value": "y"})

    merged = x_df.merge(y_df, on=["country", "year"]).dropna(subset=["x", "y"])

    if len(merged) < 3:
        raise ValueError("At least 3 matched (country, year) pairs are required for correlation")

    x_vals = merged["x"].astype(float).to_numpy()
    y_vals = merged["y"].astype(float).to_numpy()

    pearson_r, pearson_p = pearsonr(x_vals, y_vals)
    spearman_r, spearman_p = spearmanr(x_vals, y_vals)

    return {
        "pearson_r": round(float(pearson_r), 4),
        "pearson_p": round(float(pearson_p), 6),
        "spearman_r": round(float(spearman_r), 4),
        "spearman_p": round(float(spearman_p), 6),
        "n": len(merged),
        "scatter_points": [
            {"country": row.country, "year": int(row.year), "x": round(float(row.x), 4), "y": round(float(row.y), 4)}
            for row in merged.itertuples()
        ],
    }


def compute_burden_index(
    records: list[dict],
    weights: dict | None = None,
    invert: list[str] | None = None,
) -> list[dict]:
    """
    Rank countries by a composite burden index across multiple indicators.

    records: list of {country, indicator, value}
    weights: {indicator: weight} — defaults to equal weights
    invert: indicator codes where a high value means worse outcome (score is inverted)

    Returns [{country, score, rank}] sorted by rank ascending.
    """
    invert = set(invert or [])
    df = pd.DataFrame(records)[["country", "indicator", "value"]]
    pivot = df.groupby(["country", "indicator"])["value"].mean().unstack(fill_value=np.nan)

    indicators = pivot.columns.tolist()
    if weights is None:
        weights = {ind: 1.0 for ind in indicators}

    total_weight = sum(weights.get(ind, 1.0) for ind in indicators)

    normalised = pivot.copy()
    for ind in indicators:
        col = pivot[ind].astype(float)
        col_min, col_max = col.min(), col.max()
        span = col_max - col_min
        if span == 0:
            normalised[ind] = 0.0
        else:
            normalised[ind] = (col - col_min) / span
            if ind in invert:
                normalised[ind] = 1 - normalised[ind]

    scores = pd.Series(0.0, index=pivot.index)
    for ind in indicators:
        w = weights.get(ind, 1.0)
        scores += normalised[ind].fillna(0) * (w / total_weight)

    result = (
        scores.reset_index()
        .rename(columns={0: "score"})
        .sort_values("score", ascending=False)
        .reset_index(drop=True)
    )
    result["rank"] = result.index + 1
    result["score"] = result["score"].round(4)

    return result[["country", "score", "rank"]].to_dict(orient="records")


def detect_anomalies(records: list[dict], window: int = 5) -> dict:
    """
    Flag years where a time series deviates by more than 2 standard deviations
    from its rolling mean.

    records: list of {year, value}
    Returns series (all points with bounds) and anomalies (flagged subset).
    """
    if len(records) < 3:
        raise ValueError("At least 3 data points are required for anomaly detection")

    df = pd.DataFrame(records).dropna(subset=["value"]).sort_values("year")
    df["value"] = df["value"].astype(float)

    effective_window = min(window, len(df))
    # Shift by 1 so each point is evaluated against the stats of the preceding
    # window — otherwise an outlier inflates its own rolling std and hides itself.
    trailing = df["value"].rolling(effective_window, min_periods=2)
    df["rolling_mean"] = trailing.mean().shift(1)
    df["rolling_std"] = trailing.std().shift(1)
    df["upper"] = df["rolling_mean"] + 2 * df["rolling_std"]
    df["lower"] = df["rolling_mean"] - 2 * df["rolling_std"]
    df["is_anomaly"] = (df["value"] > df["upper"]) | (df["value"] < df["lower"])

    def _row(r):
        return {
            "year": int(r.year),
            "value": round(float(r.value), 4),
            "rolling_mean": round(float(r.rolling_mean), 4) if not np.isnan(r.rolling_mean) else None,
            "upper": round(float(r.upper), 4) if not np.isnan(r.upper) else None,
            "lower": round(float(r.lower), 4) if not np.isnan(r.lower) else None,
            "is_anomaly": bool(r.is_anomaly),
        }

    series = [_row(r) for r in df.itertuples()]
    anomalies = [p for p in series if p["is_anomaly"]]

    return {"series": series, "anomalies": anomalies}


def cluster_countries(records: list[dict], n_clusters: int = 4) -> list[dict]:
    """
    Group countries into clusters based on their indicator profile.

    Feature vector per country: mean_value, trend_slope, std_dev.
    Missing values are imputed with the column mean before clustering.

    records: list of {country, year, value}
    Returns [{country, cluster, mean_value, trend_slope, std_dev}]
    """
    df = pd.DataFrame(records).dropna(subset=["value"])
    df["value"] = df["value"].astype(float)
    df["year"] = df["year"].astype(float)

    def _features(group):
        vals = group["value"].to_numpy()
        years = group["year"].to_numpy()
        mean_val = float(np.mean(vals))
        std_dev = float(np.std(vals))
        if len(vals) >= 2:
            slope, *_ = linregress(years, vals)
            trend_slope = float(slope)
        else:
            trend_slope = np.nan
        return pd.Series({"mean_value": mean_val, "trend_slope": trend_slope, "std_dev": std_dev})

    features = df.groupby("country").apply(_features, include_groups=False)

    if len(features) < n_clusters:
        raise ValueError(f"Need at least {n_clusters} countries to form {n_clusters} clusters")

    imputer = SimpleImputer(strategy="mean")
    scaler = StandardScaler()
    X = scaler.fit_transform(imputer.fit_transform(features.to_numpy()))

    labels = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit_predict(X)

    result = features.reset_index()
    result["cluster"] = labels.tolist()
    result["mean_value"] = result["mean_value"].round(4)
    result["trend_slope"] = result["trend_slope"].round(6)
    result["std_dev"] = result["std_dev"].round(4)

    return result[["country", "cluster", "mean_value", "trend_slope", "std_dev"]].to_dict(orient="records")
