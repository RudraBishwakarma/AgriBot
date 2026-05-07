// ============================================================
//  AgriBot Rover — NodeMCU ESP8266 + Cytron MDD10A
//  FlySky RC Receiver Control
// ============================================================


// ================= PIN DEFINITIONS =================

// RC Receiver pins
#define RC_THROTTLE_PIN D6   // Channel 2
#define RC_STEERING_PIN D5   // Channel 1

// Motor Driver pins
#define LEFT_PWM_PIN   D1
#define LEFT_DIR_PIN   D2

#define RIGHT_PWM_PIN  D3
#define RIGHT_DIR_PIN  D4


// ================= RC SETTINGS =================

#define RC_MIN       1000
#define RC_MAX       2000
#define RC_NEUTRAL   1500
#define RC_DEADZONE    50

// ================= MOTOR SETTINGS =================

#define PWM_MAX      1023   // ESP8266 PWM range

// ================= SAFETY SETTINGS =================

#define RC_TIMEOUT_MS 500
#define RC_SIGNAL_MIN 800
#define RC_SIGNAL_MAX 2200


// ================= GLOBAL VARIABLES =================

volatile unsigned long throttlePulse = 1500;
volatile unsigned long steeringPulse = 1500;

volatile unsigned long lastThrottleTime = 0;
volatile unsigned long lastSteeringTime = 0;

volatile unsigned long throttleStart = 0;
volatile unsigned long steeringStart = 0;


// ============================================================
// INTERRUPTS
// ============================================================

void ICACHE_RAM_ATTR throttleISR() {

  if (digitalRead(RC_THROTTLE_PIN) == HIGH) {

    throttleStart = micros();

  } else {

    if (throttleStart != 0) {

      throttlePulse = micros() - throttleStart;

      lastThrottleTime = millis();

      throttleStart = 0;
    }
  }
}


void ICACHE_RAM_ATTR steeringISR() {

  if (digitalRead(RC_STEERING_PIN) == HIGH) {

    steeringStart = micros();

  } else {

    if (steeringStart != 0) {

      steeringPulse = micros() - steeringStart;

      lastSteeringTime = millis();

      steeringStart = 0;
    }
  }
}


// ============================================================
// MOTOR FUNCTIONS
// ============================================================

void setLeftMotor(int speed, bool forward) {

  speed = constrain(speed, 0, PWM_MAX);

  digitalWrite(LEFT_DIR_PIN, forward ? HIGH : LOW);

  analogWrite(LEFT_PWM_PIN, speed);
}


void setRightMotor(int speed, bool forward) {

  speed = constrain(speed, 0, PWM_MAX);

  digitalWrite(RIGHT_DIR_PIN, forward ? HIGH : LOW);

  analogWrite(RIGHT_PWM_PIN, speed);
}


void stopMotors() {

  analogWrite(LEFT_PWM_PIN, 0);

  analogWrite(RIGHT_PWM_PIN, 0);
}


// ============================================================
// MIXER FUNCTION
// ============================================================

void mixAndDrive(int throttle, int steering) {

  int leftSpeed  = throttle + steering;

  int rightSpeed = throttle - steering;

  leftSpeed  = constrain(leftSpeed,  -PWM_MAX, PWM_MAX);

  rightSpeed = constrain(rightSpeed, -PWM_MAX, PWM_MAX);


  // LEFT MOTOR
  if (leftSpeed > 0) {

    setLeftMotor(leftSpeed, true);

  } else if (leftSpeed < 0) {

    setLeftMotor(-leftSpeed, false);

  } else {

    setLeftMotor(0, true);
  }


  // RIGHT MOTOR
  if (rightSpeed > 0) {

    setRightMotor(rightSpeed, true);

  } else if (rightSpeed < 0) {

    setRightMotor(-rightSpeed, false);

  } else {

    setRightMotor(0, true);
  }


  Serial.printf(
    "THR:%4d | STR:%4d | L:%4d | R:%4d\n",
    throttle,
    steering,
    leftSpeed,
    rightSpeed
  );
}


// ============================================================
// SETUP
// ============================================================

void setup() {

  Serial.begin(115200);

  Serial.println("AgriBot Rover Starting...");


  // Direction pins
  pinMode(LEFT_DIR_PIN, OUTPUT);

  pinMode(RIGHT_DIR_PIN, OUTPUT);


  // PWM frequency
  analogWriteFreq(1000);


  // Receiver pins
  pinMode(RC_THROTTLE_PIN, INPUT);

  pinMode(RC_STEERING_PIN, INPUT);


  // Interrupts
  attachInterrupt(
    digitalPinToInterrupt(RC_THROTTLE_PIN),
    throttleISR,
    CHANGE
  );

  attachInterrupt(
    digitalPinToInterrupt(RC_STEERING_PIN),
    steeringISR,
    CHANGE
  );


  stopMotors();

  Serial.println("Ready! Waiting for RC signal...");
}


// ============================================================
// LOOP
// ============================================================

void loop() {

  unsigned long tPulse = throttlePulse;

  unsigned long sPulse = steeringPulse;

  unsigned long now = millis();


  // ===== SIGNAL TIMEOUT =====
  bool throttleOk =
    (now - lastThrottleTime) < RC_TIMEOUT_MS;

  bool steeringOk =
    (now - lastSteeringTime) < RC_TIMEOUT_MS;


  if (!throttleOk || !steeringOk) {

    stopMotors();

    Serial.println("WARNING: RC signal lost");

    delay(100);

    return;
  }


  // ===== SIGNAL VALIDATION =====
  if (
    tPulse < RC_SIGNAL_MIN ||
    tPulse > RC_SIGNAL_MAX ||
    sPulse < RC_SIGNAL_MIN ||
    sPulse > RC_SIGNAL_MAX
  ) {

    stopMotors();

    Serial.println("WARNING: Invalid RC signal");

    delay(100);

    return;
  }


  // ===== MAP RC TO PWM =====
  int throttleVal = map(
    tPulse,
    RC_MIN,
    RC_MAX,
    -PWM_MAX,
    PWM_MAX
  );

  int steeringVal = map(
    sPulse,
    RC_MIN,
    RC_MAX,
    -PWM_MAX,
    PWM_MAX
  );


  // ===== DEADZONE =====
  int deadzone = map(
    RC_DEADZONE,
    0,
    500,
    0,
    PWM_MAX
  );


  if (abs(throttleVal) < deadzone) {

    throttleVal = 0;
  }


  if (abs(steeringVal) < deadzone) {

    steeringVal = 0;
  }


  // ===== DRIVE =====
  mixAndDrive(throttleVal, steeringVal);


  delay(20);
}