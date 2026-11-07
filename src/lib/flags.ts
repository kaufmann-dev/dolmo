import sa from 'flag-icons/flags/4x3/sa.svg';
import bg from 'flag-icons/flags/4x3/bg.svg';
import cn from 'flag-icons/flags/4x3/cn.svg';
import hr from 'flag-icons/flags/4x3/hr.svg';
import cz from 'flag-icons/flags/4x3/cz.svg';
import dk from 'flag-icons/flags/4x3/dk.svg';
import nl from 'flag-icons/flags/4x3/nl.svg';
import gb from 'flag-icons/flags/4x3/gb.svg';
import ph from 'flag-icons/flags/4x3/ph.svg';
import fi from 'flag-icons/flags/4x3/fi.svg';
import fr from 'flag-icons/flags/4x3/fr.svg';
import de from 'flag-icons/flags/4x3/de.svg';
import gr from 'flag-icons/flags/4x3/gr.svg';
import hu from 'flag-icons/flags/4x3/hu.svg';
import inFlag from 'flag-icons/flags/4x3/in.svg';
import id from 'flag-icons/flags/4x3/id.svg';
import it from 'flag-icons/flags/4x3/it.svg';
import jp from 'flag-icons/flags/4x3/jp.svg';
import kr from 'flag-icons/flags/4x3/kr.svg';
import my from 'flag-icons/flags/4x3/my.svg';
import no from 'flag-icons/flags/4x3/no.svg';
import pl from 'flag-icons/flags/4x3/pl.svg';
import pt from 'flag-icons/flags/4x3/pt.svg';
import ro from 'flag-icons/flags/4x3/ro.svg';
import ru from 'flag-icons/flags/4x3/ru.svg';
import sk from 'flag-icons/flags/4x3/sk.svg';
import es from 'flag-icons/flags/4x3/es.svg';
import se from 'flag-icons/flags/4x3/se.svg';
import lk from 'flag-icons/flags/4x3/lk.svg';
import tr from 'flag-icons/flags/4x3/tr.svg';
import ua from 'flag-icons/flags/4x3/ua.svg';
import vn from 'flag-icons/flags/4x3/vn.svg';
import { isSupportedLanguage, type LanguageCode } from '#lib/languages.ts';

export type FlagInfo = {
	/** Bundled SVG URL of the flag. */
	src: string;
	/** Three-letter country code shown under the flag. */
	country: string;
};

/**
 * Flag and country code for each session language. Each SVG is imported on its own so the
 * bundle contains only these files. `satisfies` makes a missing or extra language a type error.
 */
export const LANGUAGE_FLAGS = {
	ar: { src: sa, country: 'SAU' },
	bg: { src: bg, country: 'BGR' },
	zh: { src: cn, country: 'CHN' },
	hr: { src: hr, country: 'HRV' },
	cs: { src: cz, country: 'CZE' },
	da: { src: dk, country: 'DNK' },
	nl: { src: nl, country: 'NLD' },
	en: { src: gb, country: 'GBR' },
	fil: { src: ph, country: 'PHL' },
	fi: { src: fi, country: 'FIN' },
	fr: { src: fr, country: 'FRA' },
	de: { src: de, country: 'DEU' },
	el: { src: gr, country: 'GRC' },
	hu: { src: hu, country: 'HUN' },
	hi: { src: inFlag, country: 'IND' },
	id: { src: id, country: 'IDN' },
	it: { src: it, country: 'ITA' },
	ja: { src: jp, country: 'JPN' },
	ko: { src: kr, country: 'KOR' },
	ms: { src: my, country: 'MYS' },
	no: { src: no, country: 'NOR' },
	pl: { src: pl, country: 'POL' },
	pt: { src: pt, country: 'PRT' },
	ro: { src: ro, country: 'ROU' },
	ru: { src: ru, country: 'RUS' },
	sk: { src: sk, country: 'SVK' },
	es: { src: es, country: 'ESP' },
	sv: { src: se, country: 'SWE' },
	ta: { src: lk, country: 'LKA' },
	tr: { src: tr, country: 'TUR' },
	uk: { src: ua, country: 'UKR' },
	vi: { src: vn, country: 'VNM' }
} satisfies Record<LanguageCode, FlagInfo>;

/** Flag for a language code; undefined for codes outside the session list. */
export function languageFlag(code: string): FlagInfo | undefined {
	return isSupportedLanguage(code) ? LANGUAGE_FLAGS[code] : undefined;
}
