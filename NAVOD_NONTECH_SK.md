## Jednoduchý návod (pre netechnického používateľa)

Tento návod vás krok za krokom prevedie prvým spustením webu na počítači a jednoduchým zverejnením na internete. Nie sú potrebné pokročilé technické znalosti.

### Čo budete potrebovať
- Počítač s Windows 10/11 alebo macOS
- Internetové pripojenie
- Približne 20–30 minút času pri prvom spustení

---

### A) Spustenie cez Cursor IDE (odporúčané pre všetkých)
1) Nainštalujte si editor Cursor: otvorte stránku [Cursor – AI IDE](https://cursor.com) a stiahnite inštalátor pre váš systém (Windows alebo macOS). Prejdite klasickou inštaláciou.

2) Otvorte projekt v Cursore:
   - Spustite Cursor → File → Open Folder → vyberte priečinok projektu `droneeye`.

3) Skontrolujte, či máte nainštalovaný Node.js (potrebné na spustenie webu):
   - Ak ho nemáte, nainštalujte „LTS“ z [Node.js (LTS)](https://nodejs.org) a Cursor reštartujte.

4) Spustite integrovaný Terminál v Cursore:
   - Menu Terminal → New Terminal (otvorí sa panel s príkazovým riadkom v spodnej časti).

5) V integrovanom Termináli spustite (stačí skopírovať a vložiť):
   ```
   npm install
   npm run dev
   ```
   - Cursor zobrazí adresu (napr. `http://localhost:5173`). Kliknite na ňu alebo ju otvorte v prehliadači.
   - Vypnutie: v tom istom okne stlačte `Ctrl + C` (Windows) alebo `Ctrl + C` (macOS).

6) Jednoduché úpravy pomocou AI v Cursore:
   - Otvorte súbor (napr. `src/i18n/messages.ts` alebo `index.html`).
   - Vľavo otvorte „Chat“ a napíšte, čo chcete zmeniť (napr. „Zmeň text tlačidla Explore na Preskúmať“). Cursor navrhne zmeny, ktoré stačí potvrdiť.

---

### B) Prvé spustenie na Windows
1) Nainštalujte si „Node.js“ (odbremení vás od technických detailov):
   - Otvorte stránku: `https://nodejs.org`
   - Stiahnite tlačidlo „LTS“ (stabilná verzia) pre Windows
   - Spustite stiahnutý súbor a len klikať Ďalej → Ďalej → Dokončiť

2) Otvorte priečinok s projektom „droneeye“:
   - Napríklad: `C:\ine\dron\droneeye`

3) Otvorte okno príkazov v tomto priečinku:
   - Kliknite do prázdneho miesta v adresnom riadku Prieskumníka, napíšte `powershell` a stlačte Enter

4) Nainštalujte potrebné súčasti (stačí raz):
   - Skopírujte a vložte do okna:
     ```powershell
     npm install
     ```

5) Spustite web a pozrite si ho v prehliadači:
   - Do toho istého okna vložte:
     ```powershell
     npm run dev
     ```
   - Zobrazí sa adresa (napr. `http://localhost:5173`). Kliknite na ňu alebo ju skopírujte do prehliadača.
   - Ak chcete web vypnúť, stlačte v okne skratku `Ctrl + C` a potvrďte `Y`.

---

### C) Prvé spustenie na macOS (MacBook/iMac)
1) Nainštalujte „Node.js“:
   - Otvorte `https://nodejs.org`
   - Stiahnite „LTS“ pre macOS a nainštalujte (ďalej → ďalej → dokončiť)

2) Otvorte priečinok s projektom „droneeye“.

3) Otvorte aplikáciu „Terminal“ (Spotlight: lupka vpravo hore → napíšte „Terminal“ → Enter).

4) Prejdite v Termináli do priečinka projektu:
   - Napíšte `cd ` (s medzerou) a myšou pretiahnite priečinok „droneeye“ do okna Terminálu, potom stlačte Enter.

5) Nainštalujte potrebné súčasti (stačí raz):
   ```bash
   npm install
   ```

6) Spustite web a pozrite si ho v prehliadači:
   ```bash
   npm run dev
   ```
   - Vypíše sa adresa (napr. `http://localhost:5173`). Otvorte ju v prehliadači.
   - Vypnutie: v Termináli stlačte `Ctrl + C`.

---

### D) Ako upraviť obsah webu (texty, obrázky, kontakty)
- Obrázky a logo: priečinok `src/assets/images/`
- Texty v slovenčine/angličtine: `src/i18n/messages.ts`
- Štýly a farby: `src/assets/style.css`
- Kontaktné údaje (email, telefón, sociálne siete): sú v súbore `index.html`

Jednoduchý postup:
1) Otvorte projekt v programe „Cursor“ (odporúčané) alebo „Visual Studio Code“
2) Urobte zmeny v súboroch vyššie
3) Súbor uložte (web v režime „npm run dev“ sa zvyčajne sám obnoví)

---

### E) Zverejnenie webu na internete (hosting)
Ak chcete web poslať na bežný hosting (napr. cez FTP):
1) V okne príkazov (Windows) alebo Termináli (Mac) spustite:
   ```
   npm run build
   ```
2) V priečinku projektu sa vytvorí priečinok `dist/` – to je finálna verzia webu
3) Nahrajte obsah priečinka `dist/` na svoj hosting (alebo pošlite správcovi hostingu)

Poznámka: Ak používate GitHub Pages, stačí:
``` 
npm run build
npm run deploy
```

---

### F) Keď sa niečo nepodarí
- Ak sa „npm install“ nepodarí, reštartujte počítač a skúste znova. Uistite sa, že máte nainštalovaný Node.js (LTS).
- Ak sa web nespustí, zatvorte okno (alebo `Ctrl + C`), otvorte ho znova v priečinku projektu a skúste:
  ```
  npm run dev
  ```
- Stále to nejde? Pošlite screenshot chyby osobe, ktorá vám projekt dodala.

---

Hotovo. Ak budete chcieť, pripravíme aj krátke video s ukážkou prvého spustenia.

