use std::fmt::Display;

use hex::FromHex;
use serde::{Deserialize, Deserializer, Serializer};

pub fn trim_string<'de, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'de>,
{
  let value: String = Deserialize::deserialize(deserializer)?;

  Ok(value.trim().to_string())
}

pub fn as_hex<T, S>(value: T, serializer: S) -> Result<S::Ok, S::Error>
where
  T: AsRef<[u8]>,
  S: Serializer,
{
  serializer.serialize_str(&hex::encode(value))
}

pub fn from_hex<'de, D, T>(deserializer: D) -> Result<T, D::Error>
where
  D: Deserializer<'de>,
  T: FromHex,
  T::Error: Display,
{
  use serde::de::Error;

  let hex_str = String::deserialize(deserializer)?;

  T::from_hex(hex_str).map_err(|err| Error::custom(format!("Unable to deserialize hex: {err}")))
}

#[cfg(test)]
mod tests {
  use super::*;
  use serde::{Deserialize, Serialize};
  use serde_json::json;

  #[test]
  fn deserialize_trim() {
    #[derive(Debug, PartialEq, Eq, Deserialize)]
    struct Test {
      #[serde(deserialize_with = "trim_string")]
      string: String,
    }

    let value: Test = serde_json::from_value(json!({
      "string": "   string   ",
    }))
    .unwrap();

    let expected = Test {
      string: "string".to_string(),
    };

    assert_eq!(value, expected);
  }

  #[test]
  fn serialize_slice_as_hex() {
    #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
    struct Test<'a> {
      #[serde(serialize_with = "as_hex")]
      string: &'a [u8],
    }

    let value = serde_json::to_value(Test {
      string: b"abcd", // 'abcd' in bytes
    })
    .unwrap();

    let expected = json!({
      "string": "61626364",
    });

    assert_eq!(value, expected)
  }

  #[test]
  fn deserialize_hex_to_vec() {
    #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
    struct Test {
      #[serde(deserialize_with = "from_hex")]
      hex: Vec<u8>,
    }

    let value: Test = serde_json::from_value(json!({
      "hex": "2d7ba8f478a96bcce6f1"
    }))
    .unwrap();

    let expected = Test {
      hex: vec![45, 123, 168, 244, 120, 169, 107, 204, 230, 241],
    };

    assert_eq!(value, expected)
  }

  #[test]
  fn deserialize_hex_to_array() {
    #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
    struct Test {
      #[serde(deserialize_with = "from_hex")]
      hex: [u8; 10],
    }

    let value: Test = serde_json::from_value(json!({
      "hex": "315a1762e68e14159ddb"
    }))
    .unwrap();

    let expected = Test {
      hex: [49, 90, 23, 98, 230, 142, 20, 21, 157, 219],
    };

    assert_eq!(value, expected)
  }
}
