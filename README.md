# JURSTATIC PARK: InGen Remote Surveillance Terminal

# PROJECT LEADER : Bryan Jay L. Oja

> **Version:** 2.6 (Stable)  
> **Type:** Full-Stack WebGL Simulation  
> **Status:** SECURITY_LEVEL_5

##  Project Overview
**Jurstatic Park** is an immersive, full-stack 3D simulation that transforms the user's browser into a remote surveillance terminal for Isla Nublar Site B.

The project demonstrates a **decoupled architecture**:
*   **The Frontend (Terminal):** A high-fidelity Three.js visualization acting as a "Client."
*   **The Backend (Mainframe):** A Node.js/MongoDB system acting as a "Headless CMS."

Biological assets, spatial coordinates, and park status alerts are not hardcoded; they are fetched in real-time from the secure mainframe, simulating a live data connection.

### 🌟 Key Features
*   **Data-Driven Environment:** Dinosaur assets (positions, scale, biological info) are injected dynamically from a **MongoDB** database.
*   **Cinematic Rendering:** Utilizes **Three.js** with ACES Filmic Tone Mapping, Soft Shadows, and custom lighting.
*   **Brutalism UI:** A custom-built CSS interface designed to replicate 1990s industrial computer systems.

---

## Tech Stack

### Frontend (Client)
*   **Runtime:** Vite
*   **3D Engine:** Three.js
*   **Animation:** GSAP (GreenSock)
*   **Styling:** CSS3 (Brutalism/Sci-Fi UI)

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (via Mongoose ODM)
*   **Architecture:** MVC (Model-View-Controller) pattern.

---

## Installation & Setup Guide

### 1. Install Dependencies
**Root Folder (Frontend):**
```bash
npm install

```
**Server Folder (Backend):** 
```bash
npm install

```
### 2. In order for the server to run there are Pre-requisites you must follow :
## Prerequisites
To run this project, ensure you have the following installed:

1.  **Node.js** (v16 or higher)
2.  **MongoDB Community Server** (Required ONLY if running locally)
    *   *Note: If you do not have MongoDB installed, please update the `.env` file with your own Cloud URI.*
    * If you're running locally, you must name your db "jurstatic_park"

### 3. CREATE A .env FILE (pasted copy will be sent through google classroom private submission.)

### 4. Open 2 Terminals for both Backend & Frontend

**Backend**
```bash
cd server
npm start

```
**Frontend**
```bash
npm run dev

```
🎮 Controls (Free Roam)
W / A / S / D: Move Drone Camera
Mouse: Look Around
C / V: Adjust Altitude (Up/Down)
Hover Dinos: Retrieve Biological Data


# Project Assets & Attributions

This project utilizes various third-party assets for educational and simulation purposes. Below is the comprehensive list of sources used for the 3D models, audio, and textures.

---

## 3D Models (Biological Assets)

| Asset Name | Source Link |
| :--- | :--- |
| **Tyrannosaurus Rex** | [https://sketchfab.com/3d-models/tyrant-king-tyrannosaurus-6465a297fa784598adc49f6e0042d449] |
| **Velociraptor** | [https://sketchfab.com/3d-models/dinosaur-38e1ae4d19cb417eb78a034ee7786e06] |
| **Triceratops** | [https://sketchfab.com/3d-models/triceratops-dinosaur-87527079bad44917ab1b98a456b46c7e] |
| **Spinosaurus** | [ https://sketchfab.com/3d-models/dinosaur-spinosaurus-2-13fa2131ada14963bd095ea39fe39c02] |
| **Brachiosaurus** | [https://sketchfab.com/3d-models/brachiosaurus-altithorax-c987f8cbfb7a4657af49eaa0998addec] |
| **Stegosaurus** | [https://sketchfab.com/3d-models/jpog-stegosaurus-79131313bb8f4ab0858c85f3eb3358b0] |
| **Pterodactyl** | [https://sketchfab.com/3d-models/pterodactyl-458b6b0211d64fc499d0debee157be2b] |
| **Ankylosaurus** | [https://sketchfab.com/3d-models/jpog-ankylosaurus-290765a580374c128d4d8a9f41ead1d6] |
| **Argentinosaurus** | [https://sketchfab.com/3d-models/argentinosaurus-huinculensis-7acee613d8fa4a8fa2254acfeb0da3f9] |
| **Carnotaurus** | [https://sketchfab.com/3d-models/jwtg-base-carnotaurus-6bdf5dd958b0473f8d8233866ceb876b] |
| **Parasaurolophus** | [https://sketchfab.com/3d-models/jpog-parasaurolophus-04e0ebf92de449b7a02ea3de44549fe8] |
| **Giganotosaurus** | [https://sketchfab.com/3d-models/jwe3-male-giganotosaurus-14479bc081ce4b7a93081d0e1fc574ca] |
| **Allosaurus** | [ https://sketchfab.com/3d-models/jurassic-world-dominion-allosaurus-6a5f80a6cbbe4012ba4a5e68bc55a855] |
| **Albertosaurus** | [https://sketchfab.com/3d-models/jpog-albertosaurus-4f8ab3e492de4ea495b719100aa49efc] |
| **Carcharodontosaurus** | [https://sketchfab.com/3d-models/jpog-carcharodontosaurus-39fc74a88ecf44edafe29f1568479ff2] |

---

## 🌳 Environment & Props

| Asset Name | Source Link |
| :--- | :--- |
| **Electric Fences** | [ https://sketchfab.com/3d-models/jurassic-park-fence-dirty-5da01fe1105e4179b2521de30616d9ba] |
| **Broken Fences** | [https://sketchfab.com/3d-models/jurassic-park-broken-fence-dirty-cdb2b90654384686b7ba7f4c845f429d] |
| **Gyrosphere Vehicle** | [ https://sketchfab.com/3d-models/jurassic-world-gyrosphere-0d8922f90a664853b9891e088868d7f7] |
| **Human Reference** | [https://sketchfab.com/3d-models/security-guard-f83cb67bcbc04018aed6ce3bbca11106] |

---

## 🔊 Audio & Sound

| Track Type | Source Link |
| :--- | :--- |
| **Background Music** | [https://www.youtube.com/watch?v=X38B-3YUcwY] |
| **Ambient Nature Loop** | [https://www.youtube.com/watch?v=VxrH8mUWyGc] |
| **Dinosaur Roar SFX** | [https://www.youtube.com/watch?v=qKQRjN2cDms] |

---

*All assets are used under Creative Commons licenses. No copyright infringement intended.*