# 🍬 Examen API Node.js

API REST construite avec **Express**, **Sequelize** et **MySQL**, permettant la gestion complète des utilisateurs, produits, paniers et commandes.

---

## 🚀 Installation

### 1. Installer les dépendances
Assurez-vous d’avoir Node.js et MySQL installés sur votre machine, puis exécutez :

```bash
npm install
```

### 2. Dupliquer le .env en .env.local

```bash
cp .env .env.local
``` 
Modifiez ensuite .env.local avec vos informations personnelles :

### 3. Éffectuer les migrations

```bash
npx sequelize-cli db:migrate 
``` 

### 4. Seeders

```bash
npx sequelize-cli db:seed:all
``` 