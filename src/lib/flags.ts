import flagEn from 'flag-icons/flags/4x3/gb.svg';
import flagZh from 'flag-icons/flags/4x3/cn.svg';
import flagEs from 'flag-icons/flags/4x3/es.svg';
import flagFr from 'flag-icons/flags/4x3/fr.svg';
import flagAr from 'flag-icons/flags/4x3/sa.svg';
import flagRu from 'flag-icons/flags/4x3/ru.svg';
import flagPt from 'flag-icons/flags/4x3/pt.svg';
import flagDe from 'flag-icons/flags/4x3/de.svg';
import flagJa from 'flag-icons/flags/4x3/jp.svg';
import flagHi from 'flag-icons/flags/4x3/in.svg';
import flagIt from 'flag-icons/flags/4x3/it.svg';
import flagKo from 'flag-icons/flags/4x3/kr.svg';
import flagTr from 'flag-icons/flags/4x3/tr.svg';
import flagId from 'flag-icons/flags/4x3/id.svg';
import flagVi from 'flag-icons/flags/4x3/vn.svg';
import flagNl from 'flag-icons/flags/4x3/nl.svg';
import flagPl from 'flag-icons/flags/4x3/pl.svg';
import flagUk from 'flag-icons/flags/4x3/ua.svg';
import flagFa from 'flag-icons/flags/4x3/ir.svg';
import flagSw from 'flag-icons/flags/4x3/ke.svg';
import flagBn from 'flag-icons/flags/4x3/bd.svg';
import flagUr from 'flag-icons/flags/4x3/pk.svg';
import flagTh from 'flag-icons/flags/4x3/th.svg';
import flagHe from 'flag-icons/flags/4x3/il.svg';
import flagEl from 'flag-icons/flags/4x3/gr.svg';
import flagSv from 'flag-icons/flags/4x3/se.svg';
import flagAf from 'flag-icons/flags/4x3/za.svg';
import flagMs from 'flag-icons/flags/4x3/my.svg';
import flagFil from 'flag-icons/flags/4x3/ph.svg';
import flagTa from 'flag-icons/flags/4x3/lk.svg';
import flagRo from 'flag-icons/flags/4x3/ro.svg';
import flagCs from 'flag-icons/flags/4x3/cz.svg';
import flagHu from 'flag-icons/flags/4x3/hu.svg';
import flagFi from 'flag-icons/flags/4x3/fi.svg';
import flagDa from 'flag-icons/flags/4x3/dk.svg';
import flagNo from 'flag-icons/flags/4x3/no.svg';
import flagYue from 'flag-icons/flags/4x3/hk.svg';
import flagHa from 'flag-icons/flags/4x3/ng.svg';
import flagAm from 'flag-icons/flags/4x3/et.svg';
import flagZu from 'flag-icons/flags/4x3/za.svg';
import flagTe from 'flag-icons/flags/4x3/in.svg';
import flagMr from 'flag-icons/flags/4x3/in.svg';
import flagPa from 'flag-icons/flags/4x3/in.svg';
import flagGu from 'flag-icons/flags/4x3/in.svg';
import flagKn from 'flag-icons/flags/4x3/in.svg';
import flagMl from 'flag-icons/flags/4x3/in.svg';
import flagNe from 'flag-icons/flags/4x3/np.svg';
import flagBg from 'flag-icons/flags/4x3/bg.svg';
import flagHr from 'flag-icons/flags/4x3/hr.svg';
import flagSr from 'flag-icons/flags/4x3/rs.svg';
import flagSk from 'flag-icons/flags/4x3/sk.svg';
import flagLt from 'flag-icons/flags/4x3/lt.svg';
import flagLv from 'flag-icons/flags/4x3/lv.svg';
import flagEt from 'flag-icons/flags/4x3/ee.svg';
import flagSl from 'flag-icons/flags/4x3/si.svg';
import flagKa from 'flag-icons/flags/4x3/ge.svg';
import flagHy from 'flag-icons/flags/4x3/am.svg';
import flagAz from 'flag-icons/flags/4x3/az.svg';
import flagKk from 'flag-icons/flags/4x3/kz.svg';
import flagUz from 'flag-icons/flags/4x3/uz.svg';
import flagMn from 'flag-icons/flags/4x3/mn.svg';
import flagIs from 'flag-icons/flags/4x3/is.svg';
import flagMk from 'flag-icons/flags/4x3/mk.svg';
import flagBs from 'flag-icons/flags/4x3/ba.svg';
import flagBe from 'flag-icons/flags/4x3/by.svg';
import flagCa from 'flag-icons/flags/4x3/es.svg';
import flagGl from 'flag-icons/flags/4x3/es.svg';
import flagAst from 'flag-icons/flags/4x3/es.svg';
import flagOc from 'flag-icons/flags/4x3/fr.svg';
import flagLb from 'flag-icons/flags/4x3/lu.svg';
import flagMt from 'flag-icons/flags/4x3/mt.svg';
import flagCy from 'flag-icons/flags/4x3/gb-wls.svg';
import flagPs from 'flag-icons/flags/4x3/af.svg';
import flagSd from 'flag-icons/flags/4x3/pk.svg';
import flagOr from 'flag-icons/flags/4x3/in.svg';
import flagAs from 'flag-icons/flags/4x3/in.svg';
import flagCeb from 'flag-icons/flags/4x3/ph.svg';
import flagJv from 'flag-icons/flags/4x3/id.svg';
import flagMy from 'flag-icons/flags/4x3/mm.svg';
import flagLo from 'flag-icons/flags/4x3/la.svg';
import flagKy from 'flag-icons/flags/4x3/kg.svg';
import flagTg from 'flag-icons/flags/4x3/tj.svg';
import flagMi from 'flag-icons/flags/4x3/nz.svg';
import flagLn from 'flag-icons/flags/4x3/cd.svg';
import flagLg from 'flag-icons/flags/4x3/ug.svg';
import flagSn from 'flag-icons/flags/4x3/zw.svg';
import flagWo from 'flag-icons/flags/4x3/sn.svg';
import flagFf from 'flag-icons/flags/4x3/sn.svg';
import flagSo from 'flag-icons/flags/4x3/so.svg';
import { isSupportedLanguage, type LanguageCode } from '#lib/languages.ts';

/**
 * Flag SVG for each session language, shown on its tile. Each SVG is imported on its own so the
 * bundle contains only these files. `satisfies` makes a missing or extra language a type error.
 */
export const LANGUAGE_FLAGS = {
	en: flagEn,
	zh: flagZh,
	es: flagEs,
	fr: flagFr,
	ar: flagAr,
	ru: flagRu,
	pt: flagPt,
	de: flagDe,
	ja: flagJa,
	hi: flagHi,
	it: flagIt,
	ko: flagKo,
	tr: flagTr,
	id: flagId,
	vi: flagVi,
	nl: flagNl,
	pl: flagPl,
	uk: flagUk,
	fa: flagFa,
	sw: flagSw,
	bn: flagBn,
	ur: flagUr,
	th: flagTh,
	he: flagHe,
	el: flagEl,
	sv: flagSv,
	af: flagAf,
	ms: flagMs,
	fil: flagFil,
	ta: flagTa,
	ro: flagRo,
	cs: flagCs,
	hu: flagHu,
	fi: flagFi,
	da: flagDa,
	no: flagNo,
	yue: flagYue,
	ha: flagHa,
	am: flagAm,
	zu: flagZu,
	te: flagTe,
	mr: flagMr,
	pa: flagPa,
	gu: flagGu,
	kn: flagKn,
	ml: flagMl,
	ne: flagNe,
	bg: flagBg,
	hr: flagHr,
	sr: flagSr,
	sk: flagSk,
	lt: flagLt,
	lv: flagLv,
	et: flagEt,
	sl: flagSl,
	ka: flagKa,
	hy: flagHy,
	az: flagAz,
	kk: flagKk,
	uz: flagUz,
	mn: flagMn,
	is: flagIs,
	mk: flagMk,
	bs: flagBs,
	be: flagBe,
	ca: flagCa,
	gl: flagGl,
	ast: flagAst,
	oc: flagOc,
	lb: flagLb,
	mt: flagMt,
	cy: flagCy,
	ps: flagPs,
	sd: flagSd,
	or: flagOr,
	as: flagAs,
	ceb: flagCeb,
	jv: flagJv,
	my: flagMy,
	lo: flagLo,
	ky: flagKy,
	tg: flagTg,
	mi: flagMi,
	ln: flagLn,
	lg: flagLg,
	sn: flagSn,
	wo: flagWo,
	ff: flagFf,
	so: flagSo
} satisfies Record<LanguageCode, string>;

/** Flag URL for a language code; undefined for codes outside the session list. */
export function languageFlag(code: string): string | undefined {
	return isSupportedLanguage(code) ? LANGUAGE_FLAGS[code] : undefined;
}
