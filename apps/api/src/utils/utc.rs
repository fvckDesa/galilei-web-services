use std::cell::Cell;

pub struct Utc;

thread_local! {
  static TIMESTAMP: Cell<i64> = Cell::new(0);
}

impl Utc {
  const DATE_TIME_FORMAT: &'static str = "%Y-%m-%d %H:%M:%S";

  pub fn now() -> chrono::DateTime<chrono::Utc> {
    TIMESTAMP
      .with(|cell| chrono::DateTime::<chrono::Utc>::from_timestamp(cell.get(), 0))
      .expect("invalid timestamp")
  }

  pub fn set_now_value(date_time: &str) {
    let timestamp = chrono::NaiveDateTime::parse_from_str(date_time, Self::DATE_TIME_FORMAT)
      .expect(&format!(
        "date-time string not respect the format {} for the utc now value",
        Self::DATE_TIME_FORMAT
      ))
      .and_utc()
      .timestamp();

    TIMESTAMP.with(|cell| cell.set(timestamp));
  }
}
