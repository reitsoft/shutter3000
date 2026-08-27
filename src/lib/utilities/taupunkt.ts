/**
 * Taupunkt-Berechnung nach Magnus-Formel und Kondensationsrisiko-Check
 * für Kellerlüftung / Feuchteschutz-Automatisierungen.
 *
 * Gültigkeitsbereich der Magnus-Näherung: ca. 0 °C bis 60 °C, 1–100 % rF.
 */

// Magnus-Koeffizienten für Wasser (über flüssigem Wasser, positive Temperaturen)
const MAGNUS_A = 17.62;
const MAGNUS_B = 243.12; // °C

/**
 * Berechnet den Taupunkt einer Luftmasse.
 * @param tempC   Lufttemperatur in °C
 * @param rhPercent  relative Luftfeuchte in % (0–100)
 * @returns Taupunkt in °C
 */
export function taupunkt(tempC: number, rhPercent: number): number {
	if (rhPercent <= 0 || rhPercent > 100) {
		throw new Error(`Ungültige relative Feuchte: ${rhPercent}% (erwartet 0 < rH <= 100)`);
	}

	const gamma = Math.log(rhPercent / 100) + (MAGNUS_A * tempC) / (MAGNUS_B + tempC);
	return (MAGNUS_B * gamma) / (MAGNUS_A - gamma);
}

/**
 * Sättigungsdampfdruck nach Magnus (hPa) — nützlich für absolute Feuchte o.ä.
 */
export function saettigungsdampfdruck(tempC: number): number {
	return 6.112 * Math.exp((MAGNUS_A * tempC) / (MAGNUS_B + tempC));
}

export interface KondensationsRisikoInput {
	/** Temperatur der Luft, die einströmt (z. B. Außenluft) in °C */
	quellTempC: number;
	/** relative Feuchte der einströmenden Luft in % */
	quellFeuchtePercent: number;
	/** Temperatur der Fläche, an der Kondensation entstehen könnte (z. B. Kellerwand/-luft) in °C */
	oberflaechenTempC: number;
	/** Sicherheitsabstand in Kelvin, den der Taupunkt unter der Oberflächentemperatur bleiben soll (Default 2 K) */
	sicherheitsabstandK?: number;
}

export interface KondensationsRisikoResult {
	/** Taupunkt der Quellluft in °C */
	taupunktC: number;
	/** taupunktC + sicherheitsabstandK <= oberflaechenTempC */
	risiko: boolean;
	/** verbleibender Abstand zwischen Oberflächentemp und Taupunkt in Kelvin (negativ = bereits im Risikobereich) */
	abstandK: number;
}

/**
 * Prüft, ob beim Einströmen der Quellluft (z. B. Außenluft beim Lüften)
 * Kondensation an einer kälteren Fläche (z. B. Kellerwand) zu erwarten ist.
 */
export function kondensationsRisiko(input: KondensationsRisikoInput): KondensationsRisikoResult {
	const { quellTempC, quellFeuchtePercent, oberflaechenTempC, sicherheitsabstandK = 2 } = input;

	const tp = taupunkt(quellTempC, quellFeuchtePercent);
	const abstand = oberflaechenTempC - tp;

	return {
		taupunktC: tp,
		risiko: abstand < sicherheitsabstandK,
		abstandK: abstand
	};
}