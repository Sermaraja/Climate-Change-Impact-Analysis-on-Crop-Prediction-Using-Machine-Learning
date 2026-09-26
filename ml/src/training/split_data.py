import pandas as pd
from sklearn.model_selection import train_test_split
from typing import Tuple


def create_train_val_test_splits(
    X: pd.DataFrame, y: pd.Series, train_ratio: float = 0.70, val_ratio: float = 0.15, test_ratio: float = 0.15, random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    Split dataset into Train (70%), Validation (15%), and Test (15%) splits
    without data leakage.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"

    # First split off train set
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=(1.0 - train_ratio), random_state=random_state, stratify=y if len(pd.Series(y).unique()) > 1 else None
    )

    # Split remaining into Validation and Test
    relative_val_size = val_ratio / (val_ratio + test_ratio)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=(1.0 - relative_val_size), random_state=random_state, stratify=y_temp if len(pd.Series(y_temp).unique()) > 1 else None
    )

    return X_train, X_val, X_test, y_train, y_val, y_test
