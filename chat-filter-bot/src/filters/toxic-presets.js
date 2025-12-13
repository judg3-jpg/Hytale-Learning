/**
 * Toxic/Harmful Content Filter Presets
 * Comprehensive regex patterns for harmful content moderation
 * 
 * These patterns use character substitution detection to catch bypass attempts:
 * a → [a@4]
 * e → [e3]
 * i → [i1!l]
 * o → [o0]
 * s → [s$5]
 * g → [g9]
 * u → [uv]
 * etc.
 */

const toxicPresets = {
    // ============================================
    // SELF-HARM / SUICIDE
    // ============================================
    
    selfHarm_kys: {
        name: 'KYS Variants',
        pattern: '\\bk[\\s._-]*y[\\s._-]*[s$5z][\\s._-]*\\b|\\bky[$5]\\b',
        description: 'Blocks "kys" and variations (ky$, kyz, ky5)',
        action: 'delete'
    },

    selfHarm_suicide: {
        name: 'Suicide References',
        pattern: '[s$5][uv][i1!l][cç][i1!l]d[e3]|[s$5][uv][i1!l][s$5][i1!l]d[e3]',
        description: 'Blocks suicide and variations',
        action: 'delete'
    },

    selfHarm_commitSuicide: {
        name: 'Commit Suicide',
        pattern: 'c[o0]mm?[i1!l]t[\\s._-]*(s[uv][i1!l]c[i1!l]d[e3]|t[o0][a@4]st[e3]r[\\s._-]*b[a@4]th|d[i1!l][e3])',
        description: 'Blocks "commit suicide", "commit toaster bath", "commit die"',
        action: 'delete'
    },

    selfHarm_kermitSuicide: {
        name: 'Kermit Suicide',
        pattern: 'k[e3]rm[i1!l]t[\\s._-]*(s[uv][i1!l]c[i1!l]d[e3]|d[i1!l][e3])',
        description: 'Blocks "kermit suicide", "kermit die"',
        action: 'delete'
    },

    selfHarm_killYourself: {
        name: 'Kill/End Yourself',
        pattern: '(k[i1!l]+[\\s._-]*y[o0][uv]r?[\\s._-]*s[e3]lf|[e3]nd[\\s._-]*(y[o0])?[uv]r?[\\s._-]*(l[i1!l]f[e3]|s[e3]lf)|sh[o0]+t[\\s._-]*y[o0][uv]r?[\\s._-]*s[e3]lf|d[i1!l][e3][\\s._-]*[uv]r?[\\s._-]*s[e3]lf)',
        description: 'Blocks "kill yourself", "end your life", "end urself", etc.',
        action: 'delete'
    },

    selfHarm_hangYourself: {
        name: 'Hang Yourself',
        pattern: 'h[a@4]ng[\\s._-]*(y[o0][uv]r?|[uv]r)[\\s._-]*s[e3]lf',
        description: 'Blocks "hang yourself", "hang urself"',
        action: 'delete'
    },

    selfHarm_slitWrists: {
        name: 'Slit Wrists',
        pattern: 'sl[i1!l]t[\\s._-]*(y[o0][uv]r?|[uv]r)[\\s._-]*wr[i1!l]st[s$5]?',
        description: 'Blocks "slit your wrists", "slit ur wrist"',
        action: 'delete'
    },

    selfHarm_stopLiving: {
        name: 'Stop Living',
        pattern: 'st[o0]p[\\s._-]*l[i1!l]v[i1!l]ng',
        description: 'Blocks "stop living"',
        action: 'delete'
    },

    selfHarm_drinkBleach: {
        name: 'Drink Bleach',
        pattern: 'dr[i1!l]nk[\\s._-]*bl[e3][a@4]ch',
        description: 'Blocks "drink bleach"',
        action: 'delete'
    },

    selfHarm_dieInHole: {
        name: 'Die In A Hole/Hell',
        pattern: 'd[i1!l][e3][\\s._-]*[i1!l]n[\\s._-]*([a@4][\\s._-]*)?h([o0]l[e3]|[e3]ll)',
        description: 'Blocks "die in a hole", "die in hell"',
        action: 'delete'
    },

    selfHarm_dieTomorrow: {
        name: 'Die Tomorrow/IRL',
        pattern: 'd[i1!l][e3][\\s._-]*(t[o0]?m[o0]?rr?[o0]?w?|tmr|[i1!l]rl)',
        description: 'Blocks "die tomorrow", "die tmr", "die irl"',
        action: 'delete'
    },

    selfHarm_goCommit: {
        name: 'Go Commit',
        pattern: 'g[o0][\\s._-]*c[o0]mm?[i1!l]t',
        description: 'Blocks "go commit" (followed by harmful content)',
        action: 'delete'
    },

    selfHarm_considerSuicide: {
        name: 'Consider Suicide',
        pattern: 'c[o0]ns[i1!l]d[e3]r[\\s._-]*s[uv][i1!l]c[i1!l]d[e3]',
        description: 'Blocks "consider suicide"',
        action: 'delete'
    },

    // ============================================
    // DEATH WISHES
    // ============================================

    deathWish_hopeYouDie: {
        name: 'Hope You Die',
        pattern: 'h[o0]p[e3][\\s._-]*(y[o0][uv]|[uv])[\\s._-]*d[i1!l][e3]',
        description: 'Blocks "hope you die", "hope u die"',
        action: 'delete'
    },

    deathWish_hopeMomDies: {
        name: 'Hope Family Dies',
        pattern: 'h[o0]p[e3][\\s._-]*(y[o0][uv]r?|[uv]r)[\\s._-]*(m[o0]m|m[uv]m|d[a@4]d|f[a@4]m[i1!l]ly)[\\s._-]*d[i1!l][e3][s$5]?',
        description: 'Blocks "hope your mom dies", "hope ur dad dies"',
        action: 'delete'
    },

    deathWish_momDead: {
        name: 'Your Mom Dead',
        pattern: '(y[o0][uv]r?|[uv]r)[\\s._-]*(m[o0]m|m[uv]m|d[a@4]d)[\\s._-]*d[e3][a@4]d',
        description: 'Blocks "your mom dead", "ur dad dead"',
        action: 'delete'
    },

    deathWish_getCancer: {
        name: 'Get Cancer/AIDS',
        pattern: 'g[e3]t[\\s._-]*(c[a@4]nc[e3]r|[a@4][i1!l]?d[s$5]|[a@4]1d[s$5]|4[i1!l]d[s$5]|h[i1!l]v|h1v)',
        description: 'Blocks "get cancer", "get aids", "get hiv" and variations',
        action: 'delete'
    },

    deathWish_isCancer: {
        name: 'Is/Are Cancer',
        pattern: '(([i1!l][s$5]|[a@4]r[e3])[\\s._-]*)?c[a@4]nc[e3]r',
        description: 'Blocks "is cancer", "are cancer"',
        action: 'delete'
    },

    // ============================================
    // N-WORD VARIATIONS
    // ============================================

    nWord_full: {
        name: 'N-Word (Full)',
        pattern: 'n+[i1!l]+[g9]+[e3]*r+|n[i1!l][g9]{2,}[e3]r|n1[g9]+[e3]?r|n[i1!l]99[e3]?r|n[i1!l][g9]+h?[e3]r|n[i1!l][g9]+3r',
        description: 'Blocks the n-word with hard R and variations',
        action: 'delete'
    },

    nWord_soft: {
        name: 'N-Word (Soft)',
        pattern: 'n+[i1!l]+[g9]+[a@4]+[s$5z]?|n1[g9]+[a@4]|n[i1!l][g9]{2,}[a@4]|n[i1!l][g9]+[uv]h?',
        description: 'Blocks the n-word soft A and variations',
        action: 'delete'
    },

    nWord_abbreviations: {
        name: 'N-Word Abbreviations',
        pattern: '\\bn[i1!l][g9][s$5z]?\\b|\\bn[g9]+[a@4]\\b|\\bn[i1!l]bb?[a@4]?\\b',
        description: 'Blocks "nig", "nga", "nibba" etc.',
        action: 'delete'
    },

    nWord_creative: {
        name: 'N-Word Creative Bypasses',
        pattern: 'n[i1!l]q+[e3a@4]r?|n[i1!l]b[e3]r|\\/\\\\\\/?[i1!l][g9]+[e3]r|n[a@4]t[e3][\\s._-]*h[i1!l][g9]+[e3]r[s$5]?|n[i1!l][g9]+[a@4]?[\\s._-]?b[a@4]ll[s$5]?|n[i1!l][g9]+[a@4]_|_n[i1!l][g9]+[a@4]',
        description: 'Blocks creative n-word bypasses',
        action: 'delete'
    },

    nWord_nog: {
        name: 'Nig Nog',
        pattern: 'n[i1!l][g9]+[\\s._-]*n[o0][g9]',
        description: 'Blocks "nig nog"',
        action: 'delete'
    },

    // ============================================
    // F-SLUR VARIATIONS
    // ============================================

    fSlur_full: {
        name: 'F-Slur (Full)',
        pattern: 'f+[a@4]+[g9]+[o0i1!l]*t+[s$5]?|f[a@4][g9]{2,}[o0]t|f[a@4][g9]+[e3i1!l]?t',
        description: 'Blocks the f-slur and variations',
        action: 'delete'
    },

    fSlur_short: {
        name: 'F-Slur (Short)',
        pattern: '\\bf+[a@4]+[g9]+[s$5z]?\\b|\\bf[g9]t\\b|\\bf[a@4][g9]z\\b',
        description: 'Blocks "fag", "fags", "fgt", "fagz"',
        action: 'delete'
    },

    fSlur_creative: {
        name: 'F-Slur Creative',
        pattern: 'f[@4][g9]+[o0]?t|f[a@4]q+[o0]?t|ph[a@4][g9]+|f[a@4][g9]+y|f[a@4][g9]+[i1!l][e3][s$5]?|f[a@4][g9]+l[o0]rd|f[a@4][g9]+b[o0]y|f[a@4]99[o0]?t|[a@4]f[a@4][g9]+[o0]?t|ff[a@4][g9]+[o0]?t',
        description: 'Blocks f@g, phag, faggy, faglord, etc.',
        action: 'delete'
    },

    // ============================================
    // ABLEIST SLURS
    // ============================================

    ableist_retard: {
        name: 'R-Word',
        pattern: 'r[e3]t[a@4]rd([e3]d|[e3]dn[e3]ss)?|\\bt[a@4]rd\\b',
        description: 'Blocks "retard", "retarded", "tard"',
        action: 'delete'
    },

    ableist_autist: {
        name: 'Autist Slur',
        pattern: '\\b[a@4][uv]t[i1!l]st\\b',
        description: 'Blocks "autist" used as slur',
        action: 'delete'
    },

    ableist_brainDead: {
        name: 'Brain Dead',
        pattern: 'br[a@4][i1!l]n[\\s._-]*d[e3][a@4]d',
        description: 'Blocks "brain dead"',
        action: 'delete'
    },

    ableist_schizo: {
        name: 'Schizo Slur',
        pattern: '\\bsch[i1!l]z[o0]\\b',
        description: 'Blocks "schizo" used as slur',
        action: 'delete'
    },

    // ============================================
    // RACIST SLURS
    // ============================================

    racist_chink: {
        name: 'Anti-Asian Slur',
        pattern: '\\bch[i1!l]nk[s$5]?\\b|ch[i1!l]ng[\\s._-]*ch[o0]ng|ch[i1!l]n[a@4]m[a@4]n',
        description: 'Blocks "chink", "ching chong", "chinaman"',
        action: 'delete'
    },

    racist_chong: {
        name: 'Chong Slur',
        pattern: '\\bch[o0]ng\\b',
        description: 'Blocks "chong"',
        action: 'delete'
    },

    racist_coon: {
        name: 'Coon Slur',
        pattern: '\\bc[o0]+n\\b|c[o0]{2,}n',
        description: 'Blocks "coon" and variations',
        action: 'delete'
    },

    racist_jap: {
        name: 'Jap Slur',
        pattern: '\\bj[a@4]p[s$5]?\\b',
        description: 'Blocks "jap" slur',
        action: 'delete'
    },

    racist_gypsy: {
        name: 'Gypsy Slur',
        pattern: '\\bgyps[yi1!l][e3]?[s$5]?\\b',
        description: 'Blocks "gypsy" slur',
        action: 'delete'
    },

    racist_curryMuncher: {
        name: 'Curry Muncher',
        pattern: 'c[uv]rry[\\s._-]*m[uv]nch[e3]r',
        description: 'Blocks "curry muncher"',
        action: 'delete'
    },

    // ============================================
    // HOMOPHOBIC SLURS
    // ============================================

    homophobic_dyke: {
        name: 'Dyke Slur',
        pattern: '\\bd[yi1!l]k[e3][s$5]?\\b',
        description: 'Blocks "dyke" slur',
        action: 'delete'
    },

    homophobic_tranny: {
        name: 'Tranny Slur',
        pattern: '\\btr[a@4]nn[yi1!l][e3]?[s$5]?\\b',
        description: 'Blocks "tranny" slur',
        action: 'delete'
    },

    homophobic_momsGay: {
        name: 'Your Mom Gay',
        pattern: '(y[o0][uv]r?|[uv]r)[\\s._-]*(m[o0]m|m[uv]m|d[a@4]d)[s$5]?[\\s._-]*(b[i1!l]g[\\s._-]*)?(g[a@4]y|l[e3]sb[i1!l][a@4]n)',
        description: 'Blocks "your mom gay", "ur dads gay", etc.',
        action: 'delete'
    },

    // ============================================
    // NAZI / HATE SYMBOLS
    // ============================================

    nazi_swastika: {
        name: 'Swastika',
        pattern: '卐|卍|sw[a@4]+st[i1!l]k[a@4][s$5]?|sw[a@4]tst[i1!l]k[a@4]',
        description: 'Blocks swastika symbols and word',
        action: 'delete'
    },

    nazi_word: {
        name: 'Nazi',
        pattern: '\\bn[a@4]+z[i1!l]+[s$5]?\\b|n4z[i1!l]|n[a@4]z1',
        description: 'Blocks "nazi" and variations',
        action: 'delete'
    },

    nazi_kkk: {
        name: 'KKK',
        pattern: '\\bk+[\\s._-]*k+[\\s._-]*k+\\b|ku[\\s._-]*kl?[uv]x[\\s._-]*kl[a@4]n',
        description: 'Blocks "kkk", "ku klux klan"',
        action: 'delete'
    },

    nazi_holocaust: {
        name: 'Holocaust Reference',
        pattern: 'h[o0]l[o0]c[a@4][uv]st|[a@4][uv]schw[i1!l]tz',
        description: 'Blocks "holocaust", "auschwitz"',
        action: 'delete'
    },

    // ============================================
    // OTHER OFFENSIVE
    // ============================================

    offensive_slave: {
        name: 'Slave',
        pattern: '\\bsl[a@4]v[e3][s$5]?\\b',
        description: 'Blocks "slave" used offensively',
        action: 'delete'
    },

    offensive_degenerate: {
        name: 'Degenerate',
        pattern: '\\bd[e3]g[e3]n([e3]r[a@4]t[e3])?\\b',
        description: 'Blocks "degen", "degenerate"',
        action: 'delete'
    },

    offensive_fucktard: {
        name: 'Fucktard',
        pattern: 'f[uv]ck[\\s._-]*t[a@4]rd',
        description: 'Blocks "fucktard"',
        action: 'delete'
    },

    offensive_terrorist: {
        name: 'Terrorist/Taliban',
        pattern: '\\bt[e3]rr[o0]r[i1!l]st[s$5]?\\b|\\bt[a@4]l[i1!l]b[a@4]n\\b',
        description: 'Blocks "terrorist", "taliban"',
        action: 'delete'
    },

    offensive_nmsl: {
        name: 'NMSL',
        pattern: '\\bn[\\s._-]*m[\\s._-]*s[\\s._-]*l\\b',
        description: 'Blocks "NMSL" (Chinese insult)',
        action: 'delete'
    },

    offensive_boiola: {
        name: 'Boiola',
        pattern: '\\bb[o0][i1!l][o0]l[a@4]\\b',
        description: 'Blocks "boiola"',
        action: 'delete'
    },

    offensive_tabarnak: {
        name: 'Tabarnak',
        pattern: '\\bt[a@4]b[a@4]rn[a@4]k\\b',
        description: 'Blocks "tabarnak" (French Canadian profanity)',
        action: 'delete'
    },

    offensive_kanker: {
        name: 'Kanker',
        pattern: '\\bk[a@4]nk[e3]r\\b',
        description: 'Blocks "kanker" (Dutch profanity)',
        action: 'delete'
    },

    offensive_necrophilia: {
        name: 'Necrophilia',
        pattern: 'n[e3]cr[o0]ph[i1!l]l[i1!l][a@4]',
        description: 'Blocks "necrophilia"',
        action: 'delete'
    },

    offensive_rapes: {
        name: 'Rape References',
        pattern: '\\br[a@4]p[e3][s$5]?\\b|\\br[a@4]p[i1!l]ng\\b',
        description: 'Blocks "rape", "rapes", "raping"',
        action: 'delete'
    },

    offensive_cocknball: {
        name: 'CBT Reference',
        pattern: 'c[o0]ckn?b[a@4]llt[o0]rtur[e3]',
        description: 'Blocks inappropriate references',
        action: 'delete'
    }
};

/**
 * Get all toxic presets
 */
function getAllToxicPresets() {
    return Object.entries(toxicPresets).map(([key, preset]) => ({
        key,
        ...preset
    }));
}

/**
 * Get preset by key
 */
function getToxicPreset(key) {
    return toxicPresets[key] || null;
}

/**
 * Get all preset keys
 */
function getToxicPresetKeys() {
    return Object.keys(toxicPresets);
}

module.exports = {
    toxicPresets,
    getAllToxicPresets,
    getToxicPreset,
    getToxicPresetKeys
};
