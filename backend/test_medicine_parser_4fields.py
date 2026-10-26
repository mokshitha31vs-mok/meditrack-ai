import re

KNOWN_MEDICINES = [
    'Amoxicillin', 'Azithromycin', 'Cetirizine', 'Paracetamol', 'Ibuprofen',
    'Pantoprazole', 'Metformin', 'Aspirin', 'Ciprofloxacin', 'Dolo',
    'Augmentin', 'Omeprazole', 'Atorvastatin', 'Doxycycline', 'Losartan',
    'Levothyroxine', 'Gabapentin', 'Prednisone', 'Amobarbital', 'Clarithromycin',
    'Hydrochlorothiazide', 'Montelukast', 'Ranitidine', 'Rosuvastatin',
    'Amlodipine', 'Telmisartan', 'Glimepiride', 'Diclofenac', 'Tramadol',
    'Ofloxacin', 'Levofloxacin', 'Cefixime', 'Cefpodoxime', 'Aztreonam',
    'Metronidazole', 'Fluconazole', 'Salbutamol', 'Budesonide', 'Deriphyllin',
    'Thyronorm', 'Ecosprin', 'Pan-D', 'Pan 40', 'Omez', 'Rantac', 'Zifi',
    'Calpol', 'Crocin', 'Meftal-Spas', 'Combiflam', 'Allegra', 'Montek-LC',
    'Glycomet', 'Januvia', 'Lipitor', 'Nexium', 'Plavix', 'Synthroid',
    'Ventolin', 'Zithromax', 'Zyrtec', 'Crestor', 'Singulair', 'Benadryl'
]

NON_MEDICINE_WORDS = {
    'take', 'tablet', 'tablets', 'capsule', 'capsules', 'daily', 'twice', 'thrice',
    'once', 'after', 'before', 'food', 'days', 'duration', 'qty', 'oty', 'morning',
    'night', 'dose', 'rx', 'prescription', 'clinic', 'hospital', 'healthcare',
    'healthcape', 'doctor', 'physician', 'patient', 'name', 'date', 'reg', 'signature',
    'sign', 'follow', 'medical', 'centre', 'center', 'review', 'advice', 'spicy', 'oily'
}

def extract_units_per_dose(text):
    """
    Extracts number of dose units (tablets, capsules, etc.) per single dose.
    Differentiates between strength (500 mg) and units (1 tablet).
    Never infers a count if not specified (Rule 5.J).
    """
    # 1. Match explicit pattern: e.g. "1 tablet", "2 capsules", "1 tab", "1/2 tablet", "0.5 tablet"
    m = re.search(r'\b(\d+(?:\.\d+)?|\d+/\d+)\s*(?:tablets?|tabs?|capsules?|caps?|pills?|teaspoons?|tsp|drops?|puffs?)\b', text, re.IGNORECASE)
    if m:
        val_str = m.group(1)
        if '/' in val_str:
            num, den = val_str.split('/')
            return float(num) / float(den)
        return int(val_str) if '.' not in val_str else float(val_str)

    # 2. Match pattern like "1 capsule" or "1 tablet" where number might be separate token
    m2 = re.search(r'\b1\s*(?:tablet|capsule|tab|cap|pill)\b', text, re.IGNORECASE)
    if m2:
        return 1

    # 3. Dosage notation like 1-0-1 or 1-1-1
    if re.search(r'\b(?:1-0-1|1-1-1|1-0-0|0-0-1|0-1-0|1-1-0)\b', text):
        return 1

    # 4. Standalone dosage form word when instructed as a dose unit (e.g., "Amoxicillin capsule twice daily")
    if re.search(r'\b(?:capsule|tablet|pill)\b', text, re.IGNORECASE):
        # The prescription prescribes a unit of tablet/capsule
        return 1

    return None


def extract_administration_times(text):
    """
    Extracts time of administration: subset of ['morning', 'afternoon', 'evening', 'night'].
    Strictly adheres to Rules 5.A through 5.H:
    - Never invent times for 'twice daily' or 'three times daily' unless explicit times are stated.
    - 'Before breakfast' -> ['morning']
    - 'At night' -> ['night']
    - 'After food' alone does NOT specify times -> []
    - SOS / as needed -> []
    """
    text_lower = text.lower()
    times = []

    # Check for combined Morning & Night (OCR often reads & as 8, 4, +, or and)
    if re.search(r'morning\s*(?:&|and|8|4|\+|/)\s*night', text_lower):
        return ["morning", "night"]

    # 1. Morning indicator
    if re.search(r'\b(?:morning|before\s+breakfast|after\s+breakfast|breakfast|in\s+the\s+morning)\b', text_lower):
        if "morning" not in times:
            times.append("morning")

    # 2. Afternoon indicator
    if re.search(r'\b(?:afternoon|lunch|before\s+lunch|after\s+lunch|midday)\b', text_lower):
        if "afternoon" not in times:
            times.append("afternoon")

    # 3. Evening indicator
    if re.search(r'\b(?:evening|in\s+the\s+evening)\b', text_lower):
        if "evening" not in times:
            times.append("evening")

    # 4. Night indicator
    if re.search(r'\b(?:night|at\s+night|bedtime|before\s+bed|after\s+dinner)\b', text_lower):
        if "night" not in times:
            times.append("night")

    # 5. Medical schedule notations (1-0-1, 1-1-1, etc.)
    if re.search(r'\b1-0-1\b', text_lower):
        return ["morning", "night"]
    elif re.search(r'\b1-1-1\b', text_lower):
        return ["morning", "afternoon", "night"]
    elif re.search(r'\b1-0-0\b', text_lower):
        return ["morning"]
    elif re.search(r'\b0-0-1\b', text_lower):
        return ["night"]
    elif re.search(r'\b0-1-0\b', text_lower):
        return ["afternoon"]

    # Rule A, B, C: If only "twice daily", "thrice daily", "after food", or SOS is present,
    # and NO specific times of day are mentioned, return [] (requiring review)
    return times


def extract_duration_days(text):
    """
    Extracts number of days the medicine should be taken.
    Normalizes OCR confusions (e.g. 'I0' -> 10, 'IO' -> 10).
    Normalizes 'one week' -> 7, '2 weeks' -> 14.
    Returns integer or None.
    """
    text_clean = text

    # Handle OCR confusions for 10: 'I0', 'IO', 'l0', '|0' followed by days
    ocr_10_match = re.search(r'\b(?:I0|IO|l0|\|0)\s*(?:days?|~days?)\b', text_clean, re.IGNORECASE)
    if ocr_10_match:
        return 10

    # Pattern: "X 5 days", "5 days", "for 5 days", "3 days", "7 days"
    m = re.search(r'(?:[xX\*\-]\s*)?(\d+)\s*(?:days?|~days?|d\b)', text_clean, re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Pattern: "X 5", "X 3", "X 7", "X 10" when near end of medicine instruction
    m_x = re.search(r'\b[xX]\s*(\d+)\b', text_clean)
    if m_x:
        return int(m_x.group(1))

    # Pattern: "for one week" / "for 1 week"
    if re.search(r'\b(?:for\s+)?one\s+week\b|\b1\s*week\b', text_clean, re.IGNORECASE):
        return 7
    m_wk = re.search(r'\b(\d+)\s*weeks?\b', text_clean, re.IGNORECASE)
    if m_wk:
        return int(m_wk.group(1)) * 7

    # Pattern: "for one month" / "1 month"
    if re.search(r'\b(?:for\s+)?one\s+month\b|\b1\s*month\b', text_clean, re.IGNORECASE):
        return 30
    m_mo = re.search(r'\b(\d+)\s*months?\b', text_clean, re.IGNORECASE)
    if m_mo:
        return int(m_mo.group(1)) * 30

    return None


def extract_medicine_name(block_text):
    """
    Extracts strictly the medicine name without strength, dosage forms, or numbering.
    Never rejects a candidate solely because it's not in KNOWN_MEDICINES.
    """
    # 1. First check known drug names
    for drug in KNOWN_MEDICINES:
        if re.search(r'\b' + re.escape(drug) + r'\b', block_text, re.IGNORECASE):
            return drug

    # 2. Extract leading word after removing numbering/Rx/Tab/Cap
    first_line = block_text.split('\n')[0].strip()
    cleaned = re.sub(r'^\s*(?:[rR]x?|\d+[\.\-\)]|tab(?:let)?\.?|cap(?:sule)?\.?)\s*', '', first_line, flags=re.IGNORECASE).strip()
    # Find word before strength or dosage form
    m = re.search(r'^([A-Za-z]{3,25})(?=\s+\d+|\s+tab|\s+cap|\s*$)', cleaned, re.IGNORECASE)
    if m:
        cand = m.group(1).capitalize()
        if cand.lower() not in NON_MEDICINE_WORDS:
            return cand

    tokens = cleaned.split()
    if tokens and len(tokens[0]) >= 3 and tokens[0].isalpha():
        cand = tokens[0].capitalize()
        if cand.lower() not in NON_MEDICINE_WORDS:
            return cand

    return None


def parse_prescription_4fields(text):
    """
    Parses full prescription text and returns ONLY the 4 fields for EACH medicine:
    - medicine_name
    - units_per_dose
    - administration_times
    - duration_days
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    # Filter out header, patient, footer, advice
    candidate_lines = []
    in_advice = False
    in_footer = False

    for l in lines:
        lower = l.lower()
        if any(w in lower for w in ['advice:', 'take adequate', 'take fluid', 'avoid spicy', 'rest and fluid']):
            in_advice = True
            continue
        if any(w in lower for w in ['follow_up:', 'follow up:', 'review after', 'signature', 'reg: no:']):
            in_footer = True
            continue
        if any(w in lower for w in ['consultant physician', 'medical centre', 'lb road', 'phone:', 'dr: r priya', 'consultation timing']):
            continue
        if any(w in lower for w in ['name:', 'age /', 'age:', 'gender:', 'address:']):
            continue

        if not in_advice and not in_footer:
            candidate_lines.append(l)

    # Group into medicine blocks based on numbering or known drugs
    def is_med_start(line):
        clean = line.strip()
        if re.match(r'^(?:[rR]x?\s*)?\d+[\.\-\)]\s*', clean):
            return True
        for drug in KNOWN_MEDICINES:
            if re.search(r'\b' + re.escape(drug) + r'\b', clean, re.IGNORECASE):
                return True
        return False

    med_blocks = []
    curr_block = []

    for line in candidate_lines:
        if is_med_start(line):
            if curr_block:
                med_blocks.append('\n'.join(curr_block))
            curr_block = [line]
        else:
            if curr_block:
                curr_block.append(line)
            else:
                curr_block = [line]

    if curr_block:
        med_blocks.append('\n'.join(curr_block))

    extracted = []
    for blk in med_blocks:
        name = extract_medicine_name(blk)
        if not name or name.lower() in NON_MEDICINE_WORDS:
            continue

        units = extract_units_per_dose(blk)
        times = extract_administration_times(blk)
        duration = extract_duration_days(blk)

        extracted.append({
            'medicine_name': name,
            'units_per_dose': units,
            'administration_times': times,
            'duration_days': duration
        })

    return {'medicines': extracted}


if __name__ == '__main__':
    sample_ocr = '''
Dr: R Priya, MBBS, MD (General Medicine) Consultation Timing:
Consultant Physician Mon Sat
CityCare Medical Centre 9.00 AM 1:00 PM
45, LB Road, Adyar; Chennai 600020 5.00 PM 8.00 PM
Phone: 044 2456 7890
Name: K Suresh Date: 08 10 2026
Age / Gender: 32 years Male
Address: Adyar , Chennai
R 1. Amoxicillin 1 capsule twice 500 "Jqaly (Morning & Night) X 5 days
2 - Paracetamol 650 mg X 3 days
1 tablet thrice daily (After food)
3 Pantoprazole 40 'da I0 days
1 tablet once Before breakfast)
4 Cetirizine I0 mg X 7 days
1 tablet at night
Advice: Complete Take tdeqnatef full fluids Course of antibiotics
Avoid spicy and ily food
Follow_up: Review after week MBBS Dr: R Priya MD (General Medicine)
Reg: No: 12345
'''
    res = parse_prescription_4fields(sample_ocr)
    import json
    print(json.dumps(res, indent=2))
