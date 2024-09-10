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
}
