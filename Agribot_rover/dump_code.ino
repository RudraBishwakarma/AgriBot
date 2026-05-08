/*
 * ESP32 + MDD10A DIRECT MOTOR TEST
 * SIMPLEST POSSIBLE TEST
 * NO RECEIVER
 * NO INTERRUPTS
 * NO RC
 */

// ===============================
// GPIO PINS
// ===============================

#define DIR1   17
#define PWM1   18

#define DIR2   19
#define PWM2   21


// ===============================
// SETUP
// ===============================

void setup() {

  Serial.begin(115200);

  Serial.println("DIRECT MOTOR TEST");


  // Direction pins
  pinMode(DIR1, OUTPUT);
  pinMode(DIR2, OUTPUT);


  // PWM attach
  ledcAttach(PWM1, 1000, 8);
  ledcAttach(PWM2, 1000, 8);


  // Forward direction
  digitalWrite(DIR1, HIGH);
  digitalWrite(DIR2, HIGH);


  Serial.println("PWM START");
}


// ===============================
// LOOP
// ===============================

void loop() {

  // Full PWM
  ledcWrite(PWM1, 220);

  ledcWrite(PWM2, 220);

  Serial.println("MOTORS SHOULD MOVE");

  delay(1000);
}