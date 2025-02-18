# Game Specification Document

This document describes the complete rules and technical design for a local multiplayer game. The game is designed for 4–7 players sharing a single device (e.g., a tablet) and is implemented as a web application using React and MobX with data stored in Local Storage.

---

## 1. Overview

- **Objective:** Each player aims to maximize their final balance by strategically adjusting levels, participating in lotteries and auctions, and managing penalties/bonuses.
- **Setup:** All players contribute an initial sum (default 10,000 units). From this, a fixed amount (default 1,000) is deposited into a shared bank.
- **Player Actions:** On each turn, players make decisions on:
  - **Level Adjustment:** Choose to raise, lower, or keep their current level.
  - **Lottery Participation:** Decide whether to join a lottery.
  - **Auction Participation:** Engage in an auction to bid for a multiplier bonus.
- **Turn Structure:** Before actions begin, each player may choose to "lock in" (exit) the game with their current balance. The game continues with remaining players.

---

## 2. Game Rules

### 2.1 Player Profile

Each player has three key attributes:

- **Current Balance:** The amount of money available.
- **Multiplier:** A factor that influences the share of bank distributions.
- **Level:** A value that can be increased or decreased; affects the multiplier.

**Starting Conditions:**

- **Balance:** 9,000 units (after 1,000 per player is deposited into the bank).
- **Multiplier:** 1.0.
- **Level:** 0.

---

### 2.2 Level Adjustment

- **Raising a Level:**
  - **Cost:** 500 units.
  - **Effect:** Increases the level by 1 and adds **+0.2** to the multiplier.
  - **Note:** This action is fixed and does not scale with any modifier.
- **Lowering a Level (Selling):**

  - **Refund:** 250 units.
  - **Effect:** Decreases the level by 1 and reduces the multiplier by **0.2**.
  - **Restriction:** A player cannot lower a level if their level is already 0.

- **No Change:** The player may also choose to leave their level unchanged.

---

### 2.3 Lottery

- **Participation:** Each player may opt in or out.
- **Cost:** The lottery fee is **100 × Modifier**.
- **Reward:** The winner receives an increase of **+0.1 × Modifier** to their multiplier.
- **Selection:** The lottery winner is chosen at random among all players who entered the lottery.
- **Note:** The cost and reward scale with the current turn's modifier.

---

### 2.4 Auction

- **Purpose:** Auction offers an additional chance to increase the multiplier.
- **Auction Prize:** A multiplier bonus of **+0.2 × Modifier**.
- **Bidding Process:**
  - Players bid in increments of 100 units.
  - The auction is played as a live bidding session among players.
  - The winning bid is determined by the players (banker acts as the recorder).
- **Result Input:** The banker enters the final auction results:
  - **Winner:** The player who won the auction.
  - **Payment:** The final bid amount is deducted from the winner’s balance and added to the bank.
  - **Reward:** The winner’s multiplier increases by **+0.2 × Modifier**.
- **Note:** If no one bids, the auction is skipped.

---

### 2.5 Bank Distribution, Penalties, and Bonuses

- **Bank Distribution:**

  - At the end of each turn, a payout is made.
  - **Calculation:** The bank’s balance is divided by the number of active players.
  - **Allocation:** This amount is distributed to players _proportionally_ based on each player’s multiplier weight.
    - _Example:_ If 1,000 units are to be distributed between two players with multipliers 1 and 2, the first receives 1/3 and the second 2/3 of 1,000.
  - **Note:** Only the calculated portion is distributed; any remaining bank balance carries over to future turns.

- **Penalty:**
  - **Who Pays:** All players with the lowest multiplier among active players.
  - **Amount:** Starts at 100 units on the first turn and increases by 50 units each subsequent turn (e.g., 100, 150, 200, …).
- **Bonus:**
  - **Who Receives:** All players with the highest multiplier among active players.
  - **Amount:** Each receives a bonus of **+0.1** to their multiplier.

---

### 2.6 Turn Modifier

- **Definition:** A special modifier affects the lottery and auction.
- **Modifier Schedule:**
  - **Turns 1–3:** Modifier = 1.
  - **Turns 4–6:** Modifier = 2.
  - **Turns 7–9:** Modifier = 3.
  - **Turn 10 and beyond:** Modifier is randomly chosen between 1 and 4 (inclusive).
- **Effects:**
  - **Lottery:** Cost becomes **100 × Modifier**; reward becomes **+0.1 × Modifier** to multiplier.
  - **Auction:** The multiplier bonus is **+0.2 × Modifier**.
  - **Level Adjustment:** Modifier does **not** affect the cost or reward for level adjustments.

---

## 3. Turn Sequence

1. **Exit Phase (Lock In):**

   - At the very start of each turn, each active player is given the option to exit the game.
   - Exiting a player locks in their current balance; they are then removed from further turns and bank distributions.

2. **Player Decision Phase:**

   - **Player Actions:**
     - **Level Adjustment:** Each player chooses to raise, lower, or keep their level.
     - **Lottery:** Each player decides whether to participate.
   - These decisions are entered via a modal window that shows the active player’s name and profile once they press the "Start" button.

3. **Auction Phase:**

   - The auction is conducted by the players around the table.
   - Players bid in increments of 100.
   - The banker records the outcome:
     - Which player won.
     - The final bid amount.
   - The winning bid is paid to the bank, and the winner’s multiplier is increased by **+0.2 × Modifier**.

4. **Payout Phase:**

   - **Bank Distribution:** A sum equal to **(bank balance ÷ number of active players)** is calculated and distributed proportionally based on each player’s multiplier.
   - **Penalty and Bonus:**
     - The player(s) with the lowest multiplier pay the penalty.
     - The player(s) with the highest multiplier receive the bonus.
   - The distributed amount is subtracted from the bank; any remaining funds remain for future turns.

5. **End of Turn:**
   - Update turn count and penalty (penalty increases by 50 each turn).
   - Update the modifier based on the schedule (or randomly, if applicable).
   - All actions and transactions are logged.

---

## 4. Technical Description

### 4.1 Technology Stack

- **Front-End Framework:** React (for building the user interface)
- **State Management:** MobX (for managing game state)
- **Data Persistence:** Local Storage (to save and load the game state)

### 4.2 User Interface

- **Setup Wizard:**
  - At the start, the banker enters the number of players (4–7) and assigns names.
  - The banker can also adjust game settings such as:
    - Initial money per player.
    - Bank contribution per player.
    - Base penalty and penalty increment.
    - Base costs for level adjustments, lottery, etc.
  - Default values are provided.
- **Main Interface Tabs:**

  - **Current Turn:** Displays current game state (turn number, bank balance, active players with their profiles).
  - **Log:** A complete, chronological record of all game actions and events.
  - **Settings:** Allows viewing and modifying game configuration parameters.

- **Player Turn Modal:**

  - At the start of each turn, a modal window appears, showing the active player's name.
  - The player can then press a "Start" button to view their profile and decision options.
  - Decisions available include:
    - Level Adjustment: Raise, lower, or keep level.
    - Lottery Participation: Join or skip.
  - Auction details are handled separately by the banker.

- **Auction Input:**

  - A dedicated screen (or modal) is used for the banker to record the auction result.
  - The banker inputs:
    - The winning player (if any).
    - The final bid amount.
  - This information is then applied to update the winning player’s balance and multiplier.

- **Reset and Save:**
  - A "Reset" button clears all game data from Local Storage and returns to the setup screen.
  - On app startup, if a saved game exists, the user is prompted to either resume or reset.

### 4.3 Data Model

- **Game State:**

  - **Players Array:** Each player object includes:
    - `name`: The player's name.
    - `balance`: Current monetary balance.
    - `multiplier`: Current multiplier.
    - `level`: Current level.
    - `active`: Status (active/inactive).
  - **Bank:** Current bank balance.
  - **Turn Number:** Current turn count.
  - **Penalty Amount:** Starting at 100 and increasing by 50 each turn.
  - **Modifier:** Current modifier value (determined by turn number or randomly as specified).
  - **Log:** A complete log of all game actions and events.
  - **Configuration:** All game parameters (initial values, costs, etc.) as set during setup.

- **Persistence:**
  - The entire game state is stored in Local Storage under a dedicated key.
  - The app automatically checks for an existing saved game on startup and prompts the user to resume or reset.

---

## 5. Summary

- **Game Mechanics:**  
  The game combines economic strategy and chance. Players adjust their levels (for a cost/benefit in multiplier), participate in lotteries and auctions (both scaled by a turn-based modifier), and face penalties or gain bonuses based on their relative multipliers.

- **Turn Flow:**  
  Each turn starts with an optional exit, followed by player decisions, a banker-managed auction, and then a payout phase that includes bank distribution, penalties, and bonuses. The game continues indefinitely until players choose to exit.

- **Technical Implementation:**  
  A web application built with React and MobX stores all game data in Local Storage. The UI is divided into tabs (Current Turn, Log, Settings), with a setup wizard for initial configuration and modal dialogs for player turns. The banker inputs critical results (auction outcomes) and manages game flow, ensuring that all actions are logged and the game state is updated correctly.

This document provides the full specification needed to implement the game and serve as a reference for further development and testing.
