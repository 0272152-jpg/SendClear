# Regulation and legal (detail for slide 7 and appendix A4)

Anything not confirmed against the primary source is marked **TODO-verify**, as AGENTS.md requires.

## Regulatory

| Topic | Answer |
|---|---|
| The three questions | **Hold client money:** yes (users keep a balance they can send or withdraw). **Lend it:** no. **Pay a yield:** no. |
| Figure | **IFPE** (Institución de Fondos de Pago Electrónico) under the Ley para Regular las Instituciones de Tecnología Financiera (Ley Fintech). |
| Route | **Years 1-2: licensed partner.** An authorized IFPE or bank holds client funds in its accounts and connects to SPEI. SendClear is the app and customer layer under a services contract. **Year 3: own IFPE** (P&L year 3 includes the application; Cash tab includes the capital). |
| Feature we will not build without a license | Holding balances in our own accounts, or paying any yield on them. |
| Cost | Partner: inside "Regulatory and legal" (MXN 1.2M in year 1) plus MXN 1.20 per transfer in cost of revenue (assumption, TODO-verify with 2 quotes). Own IFPE: minimum capital **500,000 UDIs** for one type of operation (CNBV general provisions for ITFs, art. 7, per Deloitte's summary; TODO-verify current text) ≈ **MXN 4.46M** at UDI 8.91 (DOF, Nov 2026). |
| Time | Partner integration: ~3 months (assumption). Own IFPE: CNBV authorization with the Comité Interinstitucional's opinion, **12-24 months** (TODO-verify). |
| Supervisors | **CNBV** (authorization and supervision of ITFs), **Banxico** (SPEI and payment-system rules, e-money operations), **CONDUSEF** (user protection, complaints, UNE unit). CNSF does not apply (no insurance). |
| KYC / AML from day one | Identity check at sign-up (KYC provider), transaction limits, monitoring and AML/PLD reports through the partner, as the regulated entity. Once we hold our own IFPE: compliance officer, AML manual, reports to CNBV/UIF (TODO-verify exact obligations). |

## Legal

| Topic | Answer |
|---|---|
| Company | **S.A.P.I. de C.V.** It allows share classes, vesting, drag-along/tag-along and the investor protections a SAFE converts into, which an S.A.S. does not support well (S.A.S. also has an income cap). |
| Ownership | Founders 50/50 before the seed. After the SAFE converts: founders 81.1%, seed investors 18.9% (before the Series A and any option pool; TODO decide pool). |
| Founders' agreement | 4-year vesting with a 1-year cliff. If one founder leaves, unvested shares go back to the company (good/bad-leaver price). IP assignment, non-compete and confidentiality. TODO-verify with counsel. |
| Intellectual property | Code and brand are assigned to the company by the founders. Dependencies (Expo, React Native, React Navigation, AsyncStorage) are MIT-licensed: commercial use is allowed if we keep the notices. AI tool: code generated with an AI coding assistant; under its provider's commercial terms the user owns the outputs (TODO-verify current terms). **IMPI trademark search for "SendClear" in classes 9 and 36: TODO** (marcanet.impi.gob.mx). |
| Personal data | Privacy notice shown at sign-up, with express consent (Ley Federal de Protección de Datos Personales en Posesión de los Particulares, 2025). Data collected: name, phone, KYC data and transaction history. Stored by the partner and the cloud host (region TODO). Kept as long as AML rules require, then deleted (TODO-verify retention period). ARCO rights request by email. |
| Users | Terms and conditions accepted at sign-up. Fees disclosed before every transfer (the app shows fee and total on Review). Complaints go to an in-app support channel, then the UNE unit, then CONDUSEF. |
| Contract with the partner institution | Custody of funds, SPEI access, per-transfer price, SLA and uptime, liability for errors and fraud, KYC/AML split of duties, data ownership and transfer, exit and migration of users. |
| Contract with the KYC provider | Accuracy, response time, data processing agreement, data location. |
| Contract with the cloud host | Data location, security certifications, incident notice, backups, exit. |
