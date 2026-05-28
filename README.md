# FiberFix — Automated Job-Closure System

A mobile + server system that lets fibre-optic field technicians close work orders by submitting their GPS location to a central server, reducing administrative errors and speeding up billing.

![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-Expo-61dafb?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

## Overview

FiberFix is an academic project developed for **FiberFix (Instalaciones Técnicas)**, a fibre-optic installation subcontractor with field technicians out on site. The goal is to automate the closing of work orders: a technician opens the app, enters their identifier and the ticket identifier, and the app sends their current GPS location plus a timestamp to a central server, which records the closure. Built as a team project for the DAM cross-platform development diploma.

## Tech Stack

- **Mobile**: React Native (Expo), TypeScript
- **Backend**: Java multi-threaded TCP socket server
- **Database**: MySQL 8
- **Infrastructure**: Docker (database and server containers)

## Architecture

```
┌────────────────────┐       TCP/IP        ┌─────────────────────┐
│ Mobile app         │ ──────────────────▶ │ Java multi-thread   │
│ React Native       │  pipe-delimited     │ socket server       │
│ (technician)       │   payload           │ (one thread / conn) │
└────────────────────┘                     └──────────┬──────────┘
                                                      │ JDBC
                                                      ▼
                                            ┌─────────────────────┐
                                            │ MySQL 8             │
                                            │ technicians,        │
                                            │ tickets, closures   │
                                            └─────────────────────┘
```

A technician launches the app, types their technician ID and the ticket ID, and taps **Close job**. The app fetches the device GPS, builds a pipe-delimited payload and ships it over a TCP socket. The Java server accepts the connection, parses the message, validates the technician and ticket, and writes the closure to MySQL.

### Message format

```
ID_TECHNICIAN|ID_TICKET|LATITUDE|LONGITUDE|TIMESTAMP
```

Example:

```
TEC123|TICK987|39.4699|-0.3763|2025-12-16T10:45:00
```

## Features

- Field technicians can close a ticket directly from the mobile app
- GPS location captured automatically when the closure is submitted
- Java server accepts concurrent connections (one thread per client)
- MySQL persistence for technicians, tickets and closure records
- Docker setup for the database and the server

## Getting Started

### Prerequisites

- Node.js ≥ 18 and Expo CLI for the mobile app
- Java 21 for the server
- Docker and Docker Compose for MySQL
- An Android/iOS device with Expo Go, or an emulator

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SantiCode17/FiberFix.git
   cd FiberFix
   ```
2. Start the MySQL database and server containers from `docker_listo/`.
3. Install the mobile dependencies:
   ```bash
   cd fiberfix-mobile
   npm install
   ```

### Configuration

The project ships with placeholder credentials so nothing real is checked in. Before launching the stack, replace them with values of your choice:

1. **MySQL credentials** — copy `docker_listo/mysql-rds/.env.example` to `.env` and pick a strong password. Search and replace every occurrence of `CHANGE_ME_ROOT_PASSWORD` and `CHANGE_ME_USER_PASSWORD` in `server.properties`, `Servidor/serverFiberFIx/server.properties` and the `docker_listo/init-db*.sh` scripts with the same values.
2. **Mobile endpoint** — the mobile app reads the server endpoint from a local `.env` file:

```bash
cp fiberfix-mobile/.env.example fiberfix-mobile/.env
```

```env
EXPO_PUBLIC_SERVER_IP=192.168.1.100
EXPO_PUBLIC_SERVER_PORT=5000
```

### Usage

Start the mobile app:

```bash
cd fiberfix-mobile
npx expo start
```

Scan the QR with Expo Go or press `a` to launch on Android emulator.

## Project Structure

```
FiberFix/
├── fiberfix-mobile/       React Native (Expo) app for technicians
├── Servidor/              Java TCP socket server
├── docker_listo/          Docker setup (MySQL + server containers)
├── scripts/               Helper scripts
└── server.properties      Server configuration
```

## Team

Academic team project developed as part of the DAM diploma:

- Carlos Fernández Hervás
- Andrei Felipe Staicu
- María Jurado Ibáñez
- Santiago Sánchez March

## License

Released under the [MIT License](LICENSE). Originally developed as an academic project at IES Salvador Gadea.

## Author

**Santiago Sánchez March** — [GitHub](https://github.com/SantiCode17) · [LinkedIn](https://www.linkedin.com/in/santiago-s%C3%A1nchez-march/)
