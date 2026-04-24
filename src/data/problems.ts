import { Problem } from "./types";

export const problems: Problem[] = [
  {
    id: 1,
    slug: "forward-kinematics",
    title: "Forward Kinematics (2-Link Arm)",
    difficulty: "Easy",
    topics: ["Kinematics"],
    description: `### The Problem

A robot arm has **two sticks** (called **links**) connected by **two joints** (like elbows — they rotate). You command each joint to rotate by a certain angle, and you want to know: **Where is the tip of the arm now?**

---

### Real-World Use

This is how robots actually work:
- A **manufacturing robot** rotates its joints to position a tool at a specific spot
- An **assembly robot** needs to know where its gripper will be before it grabs a part
- A **warehouse robot arm** must know where it can reach to pick items

---

### What You'll Compute

You have:
- Two sticks of fixed lengths: $l_1$ and $l_2$
- Two rotation angles (one for each joint): $\\theta_1$ and $\\theta_2$ (in radians)

You must find the **(x, y)** position of the **end-effector** (the tip of the arm).

---

### Function Signature

\`\`\`python
def forward_kinematics(l1: float, l2: float, theta1: float, theta2: float) -> tuple[float, float]:
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`l1\` | float | Length of the first link (stick) |
| \`l2\` | float | Length of the second link (stick) |
| \`theta1\` | float | Angle of the first joint in radians |
| \`theta2\` | float | Angle of the second joint in radians (relative to the first link) |

**Returns:** A tuple \`(x, y)\` — the end-effector position, each rounded to 4 decimal places.

---

### Constraints

- $0 < l_1, l_2 \\leq 10$
- $-\\pi \\leq \\theta_1, \\theta_2 \\leq \\pi$ (1 radian ≈ 57°)
- Output values must be rounded to exactly **4 decimal places**

---

### Examples

**Example 1 — Arm fully straight**

\`\`\`
Input:  l1 = 1, l2 = 1, theta1 = 0, theta2 = 0
Output: (2.0, 0.0)
\`\`\`

Both joints are at 0 radians. The arm points straight to the right. The tip is at distance $1 + 1 = 2$ from the origin.

**Example 2 — Arm makes an L-shape**

\`\`\`
Input:  l1 = 1, l2 = 1, theta1 = 0, theta2 = π/2
Output: (1.0, 1.0)
\`\`\`

The first joint is still at 0 (pointing right), but the second joint rotates 90° (π/2 radians). Now the second stick points upward, forming an L-shape. The tip ends up at (1, 1).

---

### Hint

Try using trigonometry: think about breaking each link into horizontal (x) and vertical (y) components.
`,
    theory: `## Theory: Forward Kinematics

### What is Forward Kinematics?

**Forward kinematics (FK)** answers this question: *"If I rotate my joints by these angles, where will my hand end up?"*

It's "forward" because you **move forward** from joint angles → end-effector position. This is the **natural direction** of motion for a robot: you command the joints, and the arm responds.

### Key Terms

- **Link**: A rigid stick or rod (like your forearm or upper arm)
- **Joint**: A rotating connection between two links (like your elbow or shoulder) — it has an angle
- **End-effector**: The tip of the arm, where the tool is (your hand, a gripper, a welding torch, etc.)
- **Angle (θ)**: Measured in radians. $\\pi$ radians = 180°, so $\\pi/2$ = 90°

### The 2-Link Arm Geometry

Think of it like this:

1. **First link** starts at the origin (0, 0) and rotates by $\\theta_1$
   - It extends a distance $l_1$ at this angle
   - So the elbow (joint 2) ends up at: $(l_1 \\cos(\\theta_1), l_1 \\sin(\\theta_1))$

2. **Second link** starts at the elbow and rotates by $\\theta_2$ *relative to the first link*
   - So its absolute angle is $\\theta_1 + \\theta_2$
   - It extends a distance $l_2$ at this angle
   - So the end-effector is at the elbow position PLUS the second link's contribution

**The formulas:**

$$x = l_1 \\cos(\\theta_1) + l_2 \\cos(\\theta_1 + \\theta_2)$$
$$y = l_1 \\sin(\\theta_1) + l_2 \\sin(\\theta_1 + \\theta_2)$$

### Why Does This Matter?

Every robot needs FK. Without it:
- You can't visualize where the arm will go
- You can't check if a grasp will cause a collision
- Motion planning becomes impossible

### Real Examples
- **Robotic surgery**: The surgeon needs to know exactly where the surgical tool will be
- **CNC machining**: The spindle needs precise positioning
- **Humanoid robots**: To mimic human arm motion, we compute FK for every frame

### What Comes Next?
Once you master FK, you'll learn **Inverse Kinematics (IK)**: the reverse problem — given a desired position, find the joint angles.
`,
    starterCode: `import numpy as np

def forward_kinematics(l1: float, l2: float, theta1: float, theta2: float) -> tuple:
    """
    Compute the end-effector (x, y) position for a 2-link planar arm.
    
    Args:
        l1: Length of first link
        l2: Length of second link
        theta1: First joint angle in radians
        theta2: Second joint angle in radians (relative to first link)
    
    Returns:
        Tuple (x, y) rounded to 4 decimal places
    """
    # Write code here
    pass
`,
    solutionCode: `import numpy as np

def forward_kinematics(l1: float, l2: float, theta1: float, theta2: float) -> tuple:
    x = l1 * np.cos(theta1) + l2 * np.cos(theta1 + theta2)
    y = l1 * np.sin(theta1) + l2 * np.sin(theta1 + theta2)
    return (round(x, 4), round(y, 4))
`,
    testCases: [
      {
        id: 1,
        input: { l1: 1, l2: 1, theta1: 0, theta2: 0 },
        expected: [2.0, 0.0],
        description: "Both joints at 0° — arm fully extended along x-axis",
      },
      {
        id: 2,
        input: {
          l1: 1,
          l2: 1,
          theta1: Math.PI / 2,
          theta2: 0,
        },
        expected: [0.0, 2.0],
        description: "First joint at 90° — arm points up",
      },
      {
        id: 3,
        input: {
          l1: 1,
          l2: 1,
          theta1: 0,
          theta2: Math.PI / 2,
        },
        expected: [1.0, 1.0],
        description: "Second joint at 90° — L-shaped arm",
      },
    ],
    testRunnerCode: `
import json, math
results = []
test_cases = __TEST_CASES__
for tc in test_cases:
    inp = tc["input"]
    try:
        result = forward_kinematics(inp["l1"], inp["l2"], inp["theta1"], inp["theta2"])
        result = (round(result[0], 4), round(result[1], 4))
        expected = tuple(tc["expected"])
        passed = bool(abs(result[0] - expected[0]) < 1e-3 and abs(result[1] - expected[1]) < 1e-3)
        results.append({"id": tc["id"], "passed": passed, "output": list(result), "expected": list(expected)})
    except Exception as e:
        results.append({"id": tc["id"], "passed": False, "error": str(e)})
json.dumps(results)
`,
    vizType: "forward-kinematics",
  },
  {
    id: 2,
    slug: "inverse-kinematics",
    title: "Inverse Kinematics (2-Link Arm)",
    difficulty: "Medium",
    topics: ["Kinematics"],
    description: `### The Problem

This is the reverse of Forward Kinematics: You have a **target position (x, y)** where you want the arm to reach. You need to find **which joint angles will get you there**.

---

### Real-World Use

This is how real robots actually plan motion:
- A **pick-and-place robot** gets a target coordinate for a part and must compute the angles to reach it
- A **welding robot** needs to position its torch at a specific point in space
- A **surgical arm** must angle its joints to reach the operating site

---

### The Challenge

Unlike Forward Kinematics, Inverse Kinematics can have:
- **No solution**: The target is too far away (unreachable)
- **One solution**: Some rare configurations
- **Multiple solutions**: The arm can bend different ways to reach the same spot (elbow-up vs. elbow-down)

For this problem, you always return the **elbow-up solution** (the configuration where the elbow angle is positive).

---

### Function Signature

\`\`\`python
def inverse_kinematics(l1: float, l2: float, x: float, y: float) -> tuple[float, float]:
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`l1\` | float | Length of the first link (stick) |
| \`l2\` | float | Length of the second link (stick) |
| \`x\` | float | Target x-position of the end-effector |
| \`y\` | float | Target y-position of the end-effector |

**Returns:** A tuple \`(theta1, theta2)\` in radians, rounded to 4 decimal places. Use the **elbow-up** configuration (where $\\theta_2 > 0$). If the target is unreachable, return \`(None, None)\`.

---

### Constraints

- $0 < l_1, l_2 \\leq 10$
- A target is **reachable** if: minimum distance ($|l_1 - l_2|$) ≤ distance to target ≤ maximum distance ($l_1 + l_2$)
- Always return the **elbow-up** (positive $\\theta_2$) solution
- Output angles rounded to exactly **4 decimal places**

---

### Examples

**Example 1 — Fully extended**

\`\`\`
Input:  l1 = 1, l2 = 1, x = 2, y = 0
Output: (0.0, 0.0)
\`\`\`

The target is 2 units away. Since $1 + 1 = 2$, the arm must be fully stretched. Both angles are 0.

**Example 2 — Target forms a triangle**

\`\`\`
Input:  l1 = 1, l2 = 1, x = 1, y = 1
Output: (0.7854, 1.5708)
\`\`\`

The target at (1, 1) is about 1.414 units away. The arm can reach it, and the elbow-up solution places the joints at approximately 0.785 and 1.571 radians (about 45° and 90°).

---

### Hint

Use the **law of cosines** from geometry. The two links and the target form a triangle — you can solve for the angles using triangle properties!
`,
    theory: `## Theory: Inverse Kinematics

### What is Inverse Kinematics?

**Inverse kinematics (IK)** answers: *"To reach this position (x, y), what angles should I use?"*

It's "inverse" because you work **backwards** from the goal to the joint angles. In practice, you almost always use IK — you tell a robot "grab that object at (1.5, 2.3)" and the robot computes IK to find the angles.

### Why It's Harder Than FK

| Forward Kinematics | Inverse Kinematics |
|--------------------|-------------------|
| One input → One output | One input → Multiple outputs (or none) |
| Always solvable | May have no solution (unreachable) |
| Fast to compute | Computationally harder |

### Multiple Solutions

For a 2-link arm reaching a reachable target, there are **two possible arm configurations**:

1. **Elbow-up**: The elbow bulges upward (positive angle)
2. **Elbow-down**: The elbow bulges downward (negative angle)

Both arm shapes reach the same endpoint! Most robots prefer one or the other. In this problem, you always return elbow-up.

### Reachability

The arm cannot reach everywhere. The **workspace** is a ring:
- **Outer radius**: $l_1 + l_2$ (fully extended)
- **Inner radius**: $|l_1 - l_2|$ (arm folded as tightly as possible)

If a target is outside this ring, it's **unreachable**.

### The Mathematics

For a 2-link arm, we can solve IK analytically using the **law of cosines**:

$$\\cos(\\theta_2) = \\frac{x^2 + y^2 - l_1^2 - l_2^2}{2 l_1 l_2}$$

If $|\\cos(\\theta_2)| > 1$, the target is unreachable.

Then:
$$\\theta_2 = \\text{atan2}(\\sqrt{1 - \\cos^2(\\theta_2)}, \\cos(\\theta_2))$$

$$\\theta_1 = \\text{atan2}(y, x) - \\text{atan2}(l_2 \\sin(\\theta_2), l_1 + l_2 \\cos(\\theta_2))$$

The square root term gives us the two solutions; we take the positive one (elbow-up).

### Real Applications
- **Robotic arms** in factories compute IK 50+ times per second
- **Motion planners** use IK to find collision-free paths
- **VR avatars** use IK to position arms realistically when you move your hands
- **Surgical robots** use IK to reach delicate targets precisely

### Beyond 2D
For arms with 6+ joints (like industrial robots), IK becomes much harder. Solutions typically use iterative numerical methods (Jacobian transpose, FABRIK algorithm).
`,
    starterCode: `import numpy as np

def inverse_kinematics(l1: float, l2: float, x: float, y: float) -> tuple:
    """
    Compute joint angles for a 2-link planar arm to reach (x, y).
    
    Args:
        l1: Length of first link
        l2: Length of second link
        x: Target x position
        y: Target y position
    
    Returns:
        Tuple (theta1, theta2) in radians rounded to 4 decimal places.
        Return the elbow-up solution (positive theta2).
        Return (None, None) if unreachable.
    """
    # Write code here
    pass
`,
    solutionCode: `import numpy as np

def inverse_kinematics(l1: float, l2: float, x: float, y: float) -> tuple:
    dist = x**2 + y**2
    cos_theta2 = (dist - l1**2 - l2**2) / (2 * l1 * l2)
    if abs(cos_theta2) > 1:
        return (None, None)
    theta2 = np.arctan2(np.sqrt(1 - cos_theta2**2), cos_theta2)
    theta1 = np.arctan2(y, x) - np.arctan2(l2 * np.sin(theta2), l1 + l2 * np.cos(theta2))
    return (round(theta1, 4), round(theta2, 4))
`,
    testCases: [
      {
        id: 1,
        input: { l1: 1, l2: 1, x: 2, y: 0 },
        expected: [0.0, 0.0],
        description: "Fully extended along x-axis",
      },
      {
        id: 2,
        input: { l1: 1, l2: 1, x: 0, y: 2 },
        expected: [1.5708, 0.0],
        description: "Fully extended along y-axis",
      },
      {
        id: 3,
        input: { l1: 1, l2: 1, x: 1, y: 1 },
        expected: [0.7854, 0.0],
        description: "Diagonal reach — note the specific elbow-up solution",
      },
    ],
    testRunnerCode: `
import json, math
results = []
test_cases = __TEST_CASES__
for tc in test_cases:
    inp = tc["input"]
    try:
        result = inverse_kinematics(inp["l1"], inp["l2"], inp["x"], inp["y"])
        if result[0] is None:
            passed = tc["expected"][0] is None
            results.append({"id": tc["id"], "passed": bool(passed), "output": [None, None], "expected": tc["expected"]})
        else:
            result = (round(result[0], 4), round(result[1], 4))
            expected = tuple(tc["expected"])
            # Verify via FK: the angles should produce the target position
            x_check = inp["l1"] * math.cos(result[0]) + inp["l2"] * math.cos(result[0] + result[1])
            y_check = inp["l1"] * math.sin(result[0]) + inp["l2"] * math.sin(result[0] + result[1])
            passed = bool(abs(x_check - inp["x"]) < 0.05 and abs(y_check - inp["y"]) < 0.05)
            results.append({"id": tc["id"], "passed": passed, "output": list(result), "expected": [round(x_check,4), round(y_check,4)]})
    except Exception as e:
        results.append({"id": tc["id"], "passed": False, "error": str(e)})
json.dumps(results)
`,
    vizType: "inverse-kinematics",
  },
  {
    id: 3,
    slug: "pid-controller",
    title: "PID Controller",
    difficulty: "Easy",
    topics: ["Controls"],
    description: `### The Problem

When heating water to 80°C, you adjust the stove based on how hot it currently is, how long it's been off-target, and how quickly the temperature is changing. **A PID Controller** does exactly this automatically for any system. It takes three measurements and combines them into one control signal.

---

### Real-World Examples

- **Drone altitude**: Stays at a fixed height even with wind
- **Robot arm position**: Holds position despite load changes
- **Shower temperature**: Water temperature stays constant
- **Car cruise control**: Maintains constant speed
- **Oven temperature**: Maintains baking temperature

---

### The Three Terms Explained Simply

You want to reach a **setpoint** (target). The **error** is how far you are from it.

1. **Proportional (P)**: React to how far you are now
   - Error is 10? Apply strong correction
   - Error is 1? Apply weak correction
   - Think: "The further away, the harder you push"

2. **Integral (I)**: React to the history of errors
   - If you've been slightly off for a long time, cumulative small errors add up
   - This term helps eliminate stubborn steady-state errors
   - Think: "Have I been off-target? Then push harder over time"

3. **Derivative (D)**: React to how fast the error is changing
   - If error is shrinking fast, back off to avoid overshooting
   - If error is growing, increase the correction
   - Think: "Am I getting better or worse? Adjust accordingly"

---

### Function Signature

\`\`\`python
def pid_step(kp: float, ki: float, kd: float, setpoint: float,
             current: float, integral: float, prev_error: float,
             dt: float) -> tuple[float, float, float]:
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`kp\` | float | Proportional gain (how hard to react to current error) |
| \`ki\` | float | Integral gain (how hard to react to accumulated error) |
| \`kd\` | float | Derivative gain (how hard to react to error change) |
| \`setpoint\` | float | Target value |
| \`current\` | float | Current measured value |
| \`integral\` | float | Accumulated integral from all previous steps |
| \`prev_error\` | float | Error from the previous time step |
| \`dt\` | float | Time elapsed since the previous step (seconds) |

**Returns:** A tuple \`(control_signal, new_integral, current_error)\`, each rounded to 4 decimal places.

---

### Constraints

- $K_p, K_i, K_d \\geq 0$ (gains are non-negative)
- $dt > 0$ (time step must be positive)
- Output values must be rounded to exactly **4 decimal places**

---

### Examples

**Example 1 — Just proportional (no I or D)**

\`\`\`
Input:  kp=1.0, ki=0.0, kd=0.0, setpoint=10.0, current=0.0, integral=0.0, prev_error=0.0, dt=0.1
Output: (10.0, 0.0, 10.0)
\`\`\`

Error is 10. With $K_p = 1$, control is $1.0 \\times 10 = 10$. No integral yet, no derivative. Apply full correction.

**Example 2 — The system is converging**

\`\`\`
Input:  kp=1.0, ki=0.5, kd=0.0, setpoint=10.0, current=8.0, integral=5.0, prev_error=3.0, dt=0.1
Output: (4.6, 5.2, 2.0)
\`\`\`

Error is now 2 (improving from 3). Control signal is smaller because we're closer. Integral grows slightly: $5.0 + 2.0 \\times 0.1 = 5.2$.

---

### Hint

This is the core equation — use it each step:

$$\\text{control} = K_p \\times \\text{error} + K_i \\times \\text{integral} + K_d \\times \\frac{\\text{error change}}{dt}$$
`,
    theory: `## Theory: PID Control

### The Problem PID Solves

You have a system (drone, oven, robot) at some value. You want it at a target value. You have one dial (the **control signal**) to turn. How much should you turn it?

Too much → overshoots and oscillates. Too little → creeps slowly. PID automatically finds the right balance.

### The Three Terms in Detail

**1. Proportional (P)**

$$u_P = K_p \\times e(t)$$

- The larger the error, the larger the correction
- Simple, but has problems:
  - If $K_p$ is too small, it converges slowly
  - If $K_p$ is too large, it overshoots and oscillates
  - It never perfectly reaches the target (some steady-state error)

**2. Integral (I)**

$$u_I = K_i \\times \\int_0^t e(\\tau)\\,d\\tau$$

In discrete time:
$$\\text{integral}[k] = \\text{integral}[k-1] + e[k] \\times dt$$

- Watches accumulated error over time
- If you've been slightly off for a while, I term pushes harder
- Eliminates steady-state error
- Risk: Too high $K_i$ causes overshoot and instability (**integral windup**)

**3. Derivative (D)**

$$u_D = K_d \\times \\frac{de(t)}{dt}$$

In discrete time:
$$\\frac{de}{dt} \\approx \\frac{e[k] - e[k-1]}{dt}$$

- Predicts future error by looking at the rate of change
- If error is shrinking fast, D term reduces control to prevent overshoot
- If error is growing, D term increases control
- Acts like a "damper" — stabilizes the response
- Risk: Amplifies measurement noise if not tuned carefully

### Combined Equation

$$u[k] = K_p \\times e[k] + K_i \\times \\sum_{i=0}^{k} e[i] \\times dt + K_d \\times \\frac{e[k] - e[k-1]}{dt}$$

### Typical Behaviors

- **Only P**: Converges slowly, has steady-state error, stable
- **P + I**: Reaches target (no steady-state error), but may oscillate
- **P + D**: Smooth response, reduces overshoot, but steady-state error remains
- **P + I + D**: Fast, smooth, accurate — the "Goldilocks" solution

### PID Tuning

Finding good $K_p$, $K_i$, $K_d$ is an art and science:

- **Manual tuning**: Start with P, then add I and D
- **Ziegler-Nichols method**: Systematic procedure to find tuning parameters
- **Auto-tuning**: Modern systems adjust gains automatically

A common starting point: Set $K_i$ and $K_d$ to 0, increase $K_p$ until the system oscillates, then back off. Then add I and D gradually.

### Real-World Applications in Robotics

- **Motor control**: Speed or position feedback loop
- **Drone flight**: Altitude, pitch, roll controllers all use PID
- **Robotic arm**: Joint angle control
- **Line-following robot**: Error is deviation from the line
- **Temperature control**: In manufacturing or 3D printers
- **Steering angle**: In autonomous vehicles

### Advanced Topics

- **Anti-windup**: Clamp the integral term to prevent excessive buildup
- **Feed-forward**: Add a predictive term based on system model
- **Cascaded PID**: Multiple PID loops working together (outer loop sets target for inner loop)
`,
    starterCode: `import numpy as np

def pid_step(kp: float, ki: float, kd: float, setpoint: float,
             current: float, integral: float, prev_error: float,
             dt: float) -> tuple:
    """
    Compute one step of a PID controller.
    
    Args:
        kp, ki, kd: PID gains
        setpoint: Desired target value
        current: Current measured value
        integral: Accumulated integral from previous steps
        prev_error: Error from the previous step
        dt: Time step
    
    Returns:
        Tuple (control_signal, new_integral, current_error)
    """
    # Write code here
    pass
`,
    solutionCode: `import numpy as np

def pid_step(kp: float, ki: float, kd: float, setpoint: float,
             current: float, integral: float, prev_error: float,
             dt: float) -> tuple:
    error = setpoint - current
    new_integral = integral + error * dt
    derivative = (error - prev_error) / dt
    control = kp * error + ki * new_integral + kd * derivative
    return (round(control, 4), round(new_integral, 4), round(error, 4))
`,
    testCases: [
      {
        id: 1,
        input: {
          kp: 1.0, ki: 0.0, kd: 0.0, setpoint: 10.0,
          current: 0.0, integral: 0.0, prev_error: 0.0, dt: 0.1,
        },
        expected: [10.0, 0.0, 10.0],
        description: "Pure P control — error of 10 with Kp=1",
      },
      {
        id: 2,
        input: {
          kp: 1.0, ki: 0.5, kd: 0.0, setpoint: 10.0,
          current: 8.0, integral: 5.0, prev_error: 3.0, dt: 0.1,
        },
        expected: [4.6, 5.2, 2.0],
        description: "PI control with accumulated integral",
      },
      {
        id: 3,
        input: {
          kp: 1.0, ki: 0.1, kd: 0.5, setpoint: 10.0,
          current: 9.0, integral: 2.0, prev_error: 2.0, dt: 0.1,
        },
        expected: ["-4.79", 2.1, 1.0],
        description: "Full PID with derivative damping",
      },
    ],
    testRunnerCode: `
import json
results = []
test_cases = __TEST_CASES__
for tc in test_cases:
    inp = tc["input"]
    try:
        result = pid_step(inp["kp"], inp["ki"], inp["kd"], inp["setpoint"],
                         inp["current"], inp["integral"], inp["prev_error"], inp["dt"])
        result = (round(result[0], 4), round(result[1], 4), round(result[2], 4))
        expected = tc["expected"]
        passed = bool(all(abs(float(r) - float(e)) < 0.01 for r, e in zip(result, expected)))
        results.append({"id": tc["id"], "passed": passed, "output": list(result), "expected": expected})
    except Exception as e:
        results.append({"id": tc["id"], "passed": False, "error": str(e)})
json.dumps(results)
`,
    vizType: "pid-controller",
  },
  {
    id: 4,
    slug: "kalman-filter-1d",
    title: "1D Kalman Filter",
    difficulty: "Medium",
    topics: ["Localization"],
    description: `### The Problem

A robot tracks its position on a 1D line (left-right). It has **two sources of information**:

1. **Dead reckoning**: "I moved forward 1 meter, so I should be here now"
2. **Sensor reading**: "My GPS/encoder says I'm here"

But both are noisy! Dead reckoning drifts. Sensors have errors. Which should you trust?

**The Kalman Filter** is the optimal algorithm to fuse these two noisy measurements.

---

### Real-World Use

- **Self-driving cars**: Combine GPS, IMU, and wheel encoder data
- **Drone localization**: Fuse accelerometer predictions with visual/GPS measurements
- **Robot arm**: Combine motor commands with position sensors
- **Smartphone tracking**: GPS + accelerometer fusion
- **Medical devices**: Heart rate from multiple sensors

---

### The Two Steps

**Predict Step** (you think you moved):
- Update your position estimate based on your movement command
- Your uncertainty grows (you're less sure where you are)

**Update Step** (you get a sensor reading):
- Read the sensor
- Blend your prediction with the measurement (weighted by how much you trust each)
- Your uncertainty shrinks (now you're more sure)

---

### Function Signature

\`\`\`python
def kalman_1d(x: float, P: float, z: float, u: float,
              Q: float, R: float) -> tuple[float, float]:
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`x\` | float | Current estimated position |
| \`P\` | float | Uncertainty in your estimate (variance — higher = more uncertain) |
| \`z\` | float | The sensor measurement |
| \`u\` | float | Control input / motion command (how far you commanded the robot to move) |
| \`Q\` | float | Process noise (how much uncertainty your motion adds) |
| \`R\` | float | Measurement noise (sensor accuracy — higher = noisier sensor) |

**Returns:** A tuple \`(new_x, new_P)\` — the updated position estimate and uncertainty.

---

### Constraints

- $P, Q, R > 0$ (variances must be positive)
- Output values must be rounded to exactly **4 decimal places**

---

### Examples

**Example 1 — Balanced trust**

\`\`\`
Input:  x=0, P=1, z=1, u=0, Q=0.1, R=1
Output: (0.5238, 0.5238)
\`\`\`

You think you're at 0 (uncertainty 1.0). Sensor says 1 (noise 1.0). They're equally trustworthy, so blend them: roughly 0.52. Uncertainty drops.

**Example 2 — Trust the sensor**

\`\`\`
Input:  x=10, P=100, z=5, u=0, Q=1, R=1
Output: (5.0099, 0.9901)
\`\`\`

You're very uncertain ($P = 100$). Sensor is accurate ($R = 1$). So heavily trust the sensor reading (5.0). Uncertainty drops dramatically.

**Example 3 — Trust the dead reckoning**

\`\`\`
Input:  x=5, P=0.1, z=6, u=1, Q=0.1, R=10
Output: (6.0194, 0.1942)
\`\`\`

You're confident ($P = 0.1$) and predicted well ($u = 1$). Sensor is noisy ($R = 10$). So trust your prediction more. Final estimate stays close to 6.0.

---

### Hint

The key insight: the **Kalman gain** $K$ is the blend factor. High $K$ → trust sensor. Low $K$ → trust prediction.
`,
    theory: `## Theory: The Kalman Filter

### The Core Idea

You're trying to estimate something (position, velocity, temperature) given two noisy signals:
- A **motion model** that predicts where you should be
- A **measurement** that tells you where you actually are

The **Kalman filter** is the mathematically optimal way to combine them. "Optimal" means it minimizes the expected error over time, given the noise characteristics.

### Key Insight: Uncertainty

Unlike simple averaging, the Kalman filter tracks **uncertainty (variance)** explicitly:
- If the sensor is very noisy ($R$ large) → trust it less → $K$ small
- If your motion model is accurate ($Q$ small) → trust the prediction → $K$ small
- If your sensor is accurate ($R$ small) → trust it more → $K$ large
- If you're very uncertain about your current state ($P$ large) → trust sensor more → $K$ large

The beauty: this happens **automatically** through the math!

### The Algorithm: Two Steps

**Step 1: Predict** (you command motion)

$$\\hat{x}^- = \\hat{x} + u$$
$$P^- = P + Q$$

- Update position: where you think you moved to
- Grow uncertainty: because motion adds noise

**Step 2: Update** (you measure)

$$K = \\frac{P^-}{P^- + R}$$
$$\\hat{x} = \\hat{x}^- + K \\cdot (z - \\hat{x}^-)$$
$$P = (1 - K) \\cdot P^-$$

- Kalman gain: how much to trust the measurement
- Blend prediction and measurement weighted by $K$
- Shrink uncertainty: measurement gives us information

### Understanding the Kalman Gain

$$K = \\frac{P^-}{P^- + R} = \\frac{\\text{prediction uncertainty}}{\\text{total uncertainty}}$$

- If $P^-$ is very large (prediction very uncertain), $K \\approx 1$ → trust measurement
- If $R$ is very large (measurement very noisy), $K \\approx 0$ → trust prediction
- If $P^-$ and $R$ are similar, $K \\approx 0.5$ → blend equally

### Why It's Optimal

The Kalman filter **minimizes the mean squared error** (average error squared) among all linear estimators. For Gaussian noise, it's also the optimal nonlinear estimator!

### Assumptions

The Kalman filter assumes:
- **Linear system**: $x_{new} = x + u$ (works for this 1D case)
- **Gaussian noise**: Errors are normally distributed
- **Known noise**: You know $Q$ and $R$ (often from sensor specs or testing)

If these don't hold, use the **Extended Kalman Filter (EKF)** or **Unscented Kalman Filter (UKF)**.

### Real-World Noise Tuning

- **$Q$ (process noise)**: How much does your motion model drift? Higher if there's friction, wind, or model errors.
- **$R$ (measurement noise)**: How noisy is your sensor? Check the datasheet or measure empirically.

Tuning is often done experimentally — start with rough estimates and adjust until the filter behavior looks good.

### Applications in Robotics

1. **Self-driving cars**: Fuse GPS (slow, accurate) + IMU (fast, drifts) + wheel encoders
2. **Drones**: Fuse accelerometer (drifts) + gyro (noisy) + altimeter (slow)
3. **Robot localization (SLAM)**: Fuse odometry with loop closure constraints
4. **Kalman filter networks**: Multiple robots sharing sensor data
5. **Visual tracking**: Fuse predicted motion with detected object position

### Beyond 1D

For tracking in 2D### The Problem

A robot drives on a path (a curve drawn on the ground). **How much should it turn the steering wheel** to stay on the path?

**Pure Pursuit** is a simple, elegant algorithm that every autonomous vehicle uses. The strategy: pick a point ahead on the path and **steer toward it**.

---

### Real-World Use

- **Autonomous vehicles**: Lane keeping, roundabout navigation
- **Warehouse robots**: Follow predetermined paths between shelves
- **Agricultural robots**: Plow straight rows
- **Lawn mowers**: Mow in parallel lines
- **Delivery drones**: Follow GPS waypoints (modified version)

---

### The Algorithm Intuition

1. Look ahead a fixed distance $L_d$ along the path
2. Find the point on the path at that distance
3. Calculate what steering angle would make a circular arc through that point
4. Steer with that angle

It's called "Pure Pursuit" because the robot purely pursues the lookahead point — nothing fancy, just chase!

---

### Function Signature

\`\`\`python
def pure_pursuit(robot_x: float, robot_y: float, robot_theta: float,
                 goal_x: float, goal_y: float,
                 lookahead: float, wheelbase: float) -> float:
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`robot_x\` | float | Robot's current x-position |
| \`robot_y\` | float | Robot's current y-position |
| \`robot_theta\` | float | Robot's heading angle (radians, 0 = pointing right, π/2 = pointing up) |
| \`goal_x\` | float | Lookahead point x-position (on the path) |
| \`goal_y\` | float | Lookahead point y-position (on the path) |
| \`lookahead\` | float | How far ahead to look ($L_d$, in meters or same units as position) |
| \`wheelbase\` | float | Distance from front axle to rear axle ($L$, for steering model) |

**Returns:** The steering angle $\\delta$ in radians, rounded to 4 decimal places. Positive = left turn, negative = right turn.

---

### Constraints

- $L_d > 0$ (lookahead distance must be positive)
- $L > 0$ (wheelbase must be positive)
- $-\\pi \\leq \\theta \\leq \\pi$
- Output rounded to exactly **4 decimal places**

---

### Examples

**Example 1 — Goal straight ahead**

\`\`\`
Input:  robot_x=0, robot_y=0, robot_theta=0, goal_x=2, goal_y=0, lookahead=2, wheelbase=1
Output: 0.0
\`\`\`

The goal is directly ahead. No correction needed — steer straight.

**Example 2 — Goal to the left**

\`\`\`
Input:  robot_x=0, robot_y=0, robot_theta=0, goal_x=2, goal_y=1, lookahead=2.236, wheelbase=1
Output: 0.3805
\`\`\`

The goal is ahead and slightly to the left. Turn left (positive angle) to chase it. About 0.38 radians ≈ 22°.

**Example 3 — Already heading the right way**

\`\`\`
Input:  robot_x=1, robot_y=1, robot_theta=π/4, goal_x=3, goal_y=3, lookahead=2.828, wheelbase=1.5
Output: 0.0
\`\`\`

Robot's heading already points toward the goal. No steering correction needed.

---

### Hint

Transform the goal into the robot's local coordinate frame (relative position), then use geometry to compute curvature and steering angle.
`,
    theory: `## Theory: Pure Pursuit Path Tracking

### The Problem in Context

A robot drives on a 2D plane. It follows a path (which could be a road, a line, or a sequence of waypoints). At each moment, the robot must decide: **how much to turn the steering wheel?**

You could use a complex optimal control algorithm, but Pure Pursuit is simpler, more intuitive, and works remarkably well in practice.

### The Core Idea

**Pick a lookahead point** on the path at distance $L_d$ ahead, then compute the steering angle that steers toward it.

Why a lookahead point instead of the closest point?
- **Closest point**: Would steer sharply; oscillates near the path
- **Lookahead point**: Provides "preview"; smooth, stable steering

### The Geometry

The robot has a **wheelbase** $L$ (distance from rear axle to front axle). This determines the relationship between steering angle and turning radius.

For a robot at position $(x_r, y_r)$ with heading $\\theta$ and lookahead goal at $(x_g, y_g)$:

**Step 1: Transform to local frame**

Rotate the goal into the robot's coordinate frame:

$$x_{\\text{local}} = \\cos(\\theta)(x_g - x_r) + \\sin(\\theta)(y_g - y_r)$$
$$y_{\\text{local}} = -\\sin(\\theta)(x_g - x_r) + \\cos(\\theta)(y_g - y_r)$$

Now $(x_{\\text{local}}, y_{\\text{local}})$ is the goal relative to the robot.

**Step 2: Compute curvature**

The curvature of a circle through the robot and the goal:

$$\\kappa = \\frac{2 \\times y_{\\text{local}}}{L_d^2}$$

The $y_{\\text{local}}$ tells you how far off to the side the goal is. Larger value → tighter turn needed.

**Step 3: Steering angle**

The steering angle for a car-like robot with wheelbase $L$:

$$\\delta = \\arctan(\\kappa \\times L) = \\arctan\\left(\\frac{2L \\times y_{\\text{local}}}{L_d^2}\\right)$$

This is the front wheel angle.

### Lookahead Distance Tuning

- **Small $L_d$** (e.g., 0.5 m): Tracks the path closely but oscillates, jerky steering
- **Large $L_d$** (e.g., 10 m): Smooth steering but cuts corners, lags behind the path
- **Optimal**: Usually 1–3 times the robot's width, tuned experimentally

### Why It Works

1. **Simple**: Just geometry and one parameter to tune
2. **Stable**: The lookahead provides natural damping
3. **Robust**: Works on curves, straight lines, and corners
4. **Predictive**: The lookahead gives preview information, reducing reactive overcorrection

### Limitations

- **Sharp turns**: If the path has sharp corners and $L_d$ is large, the robot cuts the corner
- **Backwards driving**: Pure Pursuit doesn't work well for reverse motion (need to modify)
- **High-speed dynamics**: Doesn't account for vehicle dynamics (tire slip, inertia)
- **Obstacle avoidance**: Doesn't plan around obstacles; just tracks the given path

### Variants and Improvements

- **Variable lookahead**: Increase $L_d$ at high speed for stability
- **Fuzzy Pure Pursuit**: Use fuzzy logic to adapt lookahead
- **Model Predictive Control (MPC)**: Optimizes trajectory over a horizon (more complex)
- **Adaptive Velocity Control**: Slow down at curves, speed up on straights

### Real Robot Example

A delivery robot navigates a warehouse:
- The path planner gives waypoints: $(0, 0) \\to (5, 0) \\to (5, 5) \\to (0, 5)$
- Pure Pursuit computes steering every 100 ms
- At each update, it picks the lookahead point 0.5 m ahead
- The robot smoothly curves around the corner from $(5, 0)$ to $(5, 5)$
- No jerky steering, no oscillation

### Connection to Kinematics

If you know the steering angle, you can predict how the robot will move using kinematics:

$$\\dot{x} = v \\cos(\\theta)$$
$$\\dot{y} = v \\sin(\\theta)$$
$$\\dot{\\theta} = \\frac{v}{L} \\tan(\\delta)$$

Where $v$ is forward speed and $\\delta$ is the steering angle computed by Pure Pursuit.t L)$$

---

### Function Signature

\`\`\`python
def pure_pursuit(robot_x: float, robot_y: float, robot_theta: float,
                 goal_x: float, goal_y: float, 
                 lookahead: float, wheelbase: float) -> float:
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| \`robot_x\` | float | Robot's current x-position |
| \`robot_y\` | float | Robot's current y-position |
| \`robot_theta\` | float | Robot's heading angle (radians) |
| \`goal_x\` | float | Lookahead point x-position |
| \`goal_y\` | float | Lookahead point y-position |
| \`lookahead\` | float | Lookahead distance $L_d$ |
| \`wheelbase\` | float | Robot wheelbase length $L$ |

**Returns:** The steering angle $\\delta$ in radians, rounded to 4 decimal places.

---

### Constraints

- $L_d > 0$ (lookahead distance must be positive)
- $L > 0$ (wheelbase must be positive)
- $-\\pi \\leq \\theta \\leq \\pi$
- Output rounded to exactly **4 decimal places**

---

### Examples

**Example 1 — Goal straight ahead**

\`\`\`
Input:  robot_x=0, robot_y=0, robot_theta=0, goal_x=2, goal_y=0, lookahead=2, wheelbase=1
Output: 0.0
\`\`\`

The goal is directly ahead of the robot. In the local frame, $y_{local} = 0$, so curvature $\\kappa = 0$ and steering angle $\\delta = 0$ — no turning needed.

**Example 2 — Goal to the left**

\`\`\`
Input:  robot_x=0, robot_y=0, robot_theta=0, goal_x=2, goal_y=1, lookahead=2.236, wheelbase=1
Output: 0.3805
\`\`\`

The goal is ahead and to the left. Local transform gives $y_{local} = 1$. Curvature: $\\kappa = 2 \\times 1 / 2.236^2 = 0.4$. Steering: $\\delta = \\arctan(0.4 \\times 1) = 0.3805$ rad ($\\approx 21.8°$) — a moderate left turn.
`,
    theory: `## Theory: Pure Pursuit

**Pure Pursuit** is a geometric path-tracking algorithm widely used in autonomous vehicles and mobile robots.

### Core Idea
The robot always steers toward a **lookahead point** on the path that is a fixed distance ahead. This creates smooth, stable tracking behavior.

### How It Works
1. Find the point on the path that is exactly $L_d$ (lookahead distance) away
2. Compute the arc that connects the robot to that point  
3. Steer along that arc

### Lookahead Distance
- **Short lookahead** → tight tracking, but oscillation near the path
- **Long lookahead** → smooth tracking, but cuts corners

### Why "Pure Pursuit"?
The robot purely pursues the lookahead point — like a dog chasing a ball that keeps moving along the path.

### The Math
The key insight is that the curvature $\\kappa = 2y_{local}/L_d^2$ comes from fitting a circular arc through the robot's position and the lookahead point. The $y_{local}$ component tells us how far off to the side the goal is.

### Applications
- Self-driving car lane following
- Warehouse robot navigation
- Agricultural robot path tracking
`,
    starterCode: `import numpy as np

def pure_pursuit(robot_x: float, robot_y: float, robot_theta: float,
                 goal_x: float, goal_y: float,
                 lookahead: float, wheelbase: float) -> float:
    """
    Compute the steering angle using Pure Pursuit.
    
    Args:
        robot_x, robot_y: Robot position
        robot_theta: Robot heading in radians
        goal_x, goal_y: Lookahead point on the path
        lookahead: Lookahead distance
        wheelbase: Robot wheelbase length
    
    Returns:
        Steering angle in radians, rounded to 4 decimal places
    """
    # Write code here
    pass
`,
    solutionCode: `import numpy as np

def pure_pursuit(robot_x: float, robot_y: float, robot_theta: float,
                 goal_x: float, goal_y: float,
                 lookahead: float, wheelbase: float) -> float:
    dx = goal_x - robot_x
    dy = goal_y - robot_y
    y_local = -np.sin(robot_theta) * dx + np.cos(robot_theta) * dy
    curvature = 2 * y_local / (lookahead ** 2)
    steering = np.arctan(curvature * wheelbase)
    return round(steering, 4)
`,
    testCases: [
      {
        id: 1,
        input: {
          robot_x: 0, robot_y: 0, robot_theta: 0,
          goal_x: 2, goal_y: 0, lookahead: 2, wheelbase: 1,
        },
        expected: 0.0,
        description: "Goal straight ahead — no steering needed",
      },
      {
        id: 2,
        input: {
          robot_x: 0, robot_y: 0, robot_theta: 0,
          goal_x: 2, goal_y: 1, lookahead: 2.236, wheelbase: 1,
        },
        expected: 0.3805,
        description: "Goal to the left — steer left",
      },
      {
        id: 3,
        input: {
          robot_x: 1, robot_y: 1, robot_theta: Math.PI / 4,
          goal_x: 3, goal_y: 3, lookahead: 2.828, wheelbase: 1.5,
        },
        expected: 0.0,
        description: "Already heading toward goal — no steering",
      },
    ],
    testRunnerCode: `
import json, math
results = []
test_cases = __TEST_CASES__
for tc in test_cases:
    inp = tc["input"]
    try:
        result = pure_pursuit(inp["robot_x"], inp["robot_y"], inp["robot_theta"],
                            inp["goal_x"], inp["goal_y"], inp["lookahead"], inp["wheelbase"])
        result = round(result, 4)
        expected = tc["expected"]
        passed = bool(abs(result - expected) < 0.01)
        results.append({"id": tc["id"], "passed": passed, "output": result, "expected": expected})
    except Exception as e:
        results.append({"id": tc["id"], "passed": False, "error": str(e)})
json.dumps(results)
`,
    vizType: "pure-pursuit",
  },
];

export function getProblemBySlug(slug: string): Problem | undefined {
  return problems.find((p) => p.slug === slug);
}
