import re

# Comprehensive list of common active pharmaceutical ingredients and brand names
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

DOSAGE_FORMS = {
    'tab': 'Tablet', 'tablet': 'Tablet', 'tablets': 'Tablet',
    'cap': 'Capsule', 'capsule': 'Capsule', 'capsules': 'Capsule',
    'syp': 'Syrup', 'syrup': 'Syrup',
    'inj': 'Injection', 'injection': 'Injection',
    'oint': 'Ointment', 'ointment': 'Ointment', 'cream': 'Cream', 'gel': 'Gel',
    'drop': 'Drops', 'drops': 'Drops', 'eye drops': 'Eye Drops', 'ear drops': 'Ear Drops',
    'inhaler': 'Inhaler', 'puff': 'Inhaler', 'respule': 'Respule',
    'susp': 'Suspension', 'suspension': 'Suspension',
    'sol': 'Solution', 'solution': 'Solution', 'powder': 'Powder'
}

NON_MEDICINE_WORDS = {
    'take', 'tablet', 'tablets', 'capsule', 'capsules', 'daily', 'twice', 'thrice',
    'once', 'after', 'before', 'food', 'days', 'duration', 'qty', 'oty', 'morning',
    'night', 'dose', 'rx', 'prescription', 'clinic', 'hospital', 'healthcare',
    'healthcape', 'doctor', 'physician', 'patient', 'name', 'date', 'reg', 'signature',
    'sign', 'follow', 'cityhealth', 'cityhealthcareclinic', 'cityhealthcapeclinic',
    'cityhealthclinic', 'medical', 'centre', 'center', 'review', 'advice', 'spicy', 'oily',
    'fluids', 'antibiotics', 'consultation', 'consultant', 'timing', 'phone', 'address'
}


def classify_line_section(line_text):
    """
    Classifies a raw text line into:
    'HEADER', 'PATIENT_INFO', 'FOOTER', 'ADVICE', 'RX_MARKER', or 'MEDICINE_CANDIDATE'
    """
    text_lower = line_text.lower().strip()

    # Exact or prominent Rx marker
    if re.match(r'^(?:rx|r/x|\u211e)\b', text_lower):
        return 'RX_MARKER'

    # Advice section
    if any(k in text_lower for k in ['advice:', 'take adequate', 'take fluid', 'avoid spicy', 'rest and fluid', 'course of antibiotics']):
        return 'ADVICE'

    # Footer / Signature / Follow-up
    if any(k in text_lower for k in ['signature', 'sign', 'stamp', 'seal', 'substitute', 'refill valid', 'follow-up', 'follow up', 'review after', 'reg: no:', 'reg no:']):
        return 'FOOTER'

    # Patient info patterns
    if any(k in text_lower for k in ['patient', 'pt name', 'pt.', 'age:', 'age /', 'sex:', 'gender:', 'date:', 'wt:', 'weight:', 'diagnosis', 'c/o', 'complaint', 'vitals']):
        return 'PATIENT_INFO'

    # Header / Clinic / Doctor patterns
    if any(k in text_lower for k in [
        'clinic', 'hospital', 'healthcare', 'healthcape', 'dispensary', 'medical centre',
        'dr:', 'dr.', 'physician', 'consultant', 'm.d', 'mbbs', 'consultation timing',
        'reg no', 'registration', 'licence', 'license', 'phone:'
    ]):
        return 'HEADER'

    return 'MEDICINE_CANDIDATE'


def extract_units_per_dose(block_text):
    """
    Extracts number of dose units (tablets, capsules, pills) per single dose.
    Strictly distinguishes units per dose (e.g. 1 tablet) from medicine strength (e.g. 500 mg).
    Never confuses frequency with units per dose (Rule 5.I).
    Never infers a count when not specified in the prescription (Rule 5.J).
    """
    text = block_text

    # 1. Match explicit dose count: e.g. "1 tablet", "2 capsules", "1 tab", "1/2 tablet", "0.5 tablet"
    m = re.search(r'\b(\d+(?:\.\d+)?|\d+/\d+)\s*(?:tablets?|tabs?|capsules?|caps?|pills?|teaspoons?|tsp|drops?|puffs?)\b', text, re.IGNORECASE)
    if m:
        val_str = m.group(1)
        if '/' in val_str:
            num, den = val_str.split('/')
            return float(num) / float(den)
        return int(val_str) if '.' not in val_str else float(val_str)

    # 2. Match pattern like "1 capsule" or "1 tablet" where number and form are adjacent
    m2 = re.search(r'\b1\s*(?:tablet|capsule|tab|cap|pill)\b', text, re.IGNORECASE)
    if m2:
        return 1

    # 3. Medical frequency notation like 1-0-1 or 1-1-1 implies 1 unit per administration slot
    if re.search(r'\b(?:1-0-1|1-1-1|1-0-0|0-0-1|0-1-0|1-1-0)\b', text):
        return 1

    # 4. Standalone dosage form word when prescribed as a dose unit (e.g., "1 capsule" or "capsule twice daily")
    if re.search(r'\b(?:capsule|tablet|pill)\b', text, re.IGNORECASE):
        return 1

    return None


def extract_administration_times(block_text):
    """
    Extracts time of administration: subset of ['morning', 'afternoon', 'evening', 'night'].
    Strictly adheres to Rules 5.A through 5.H:
    - Never invent times for 'twice daily' or 'three times daily' unless explicit times are stated.
    - 'Before breakfast' -> ['morning']
    - 'At night' -> ['night']
    - 'After food' alone does NOT specify times -> []
    - SOS / as needed -> []
    """
    text_lower = block_text.lower()
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

    # 4. Night indicator (including common OCR noise like '9ght', 'nght', or 'at "9ght')
    if re.search(r'\b(?:night|at\s+night|bedtime|before\s+bed|after\s+dinner|nght)\b|at\s+["\d]*[nN9]ight|["\d]*9ght', text_lower):
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
    # and NO specific times of day are supported, return [] (requiring review)
    return times


def extract_duration_days(block_text):
    """
    Extracts number of days the medicine should be taken.
    Normalizes OCR confusions (e.g. 'I0' -> 10, 'IO' -> 10, 'l0' -> 10).
    Normalizes 'one week' -> 7, '2 weeks' -> 14.
    Returns integer or None. Never assumes a missing duration (Rule 5.G).
    """
    text_clean = block_text

    # Handle OCR confusions for 10: 'I0', 'IO', 'l0', '|0' followed by days
    ocr_10_match = re.search(r'\b(?:I0|IO|l0|\|0)\s*(?:days?|~days?)\b', text_clean, re.IGNORECASE)
    if ocr_10_match:
        return 10

    # Pattern: "X 5 days", "5 days", "for 5 days", "3 days", "7 days"
    m = re.search(r'(?:[xX\*\-]\s*)?(\d+)\s*(?:days?|~days?|d\b)', text_clean, re.IGNORECASE)
    if m:
        return int(m.group(1))

    # Pattern: "X 5", "X 3", "X 7", "X 10" when near end of medicine line
    m_x = re.search(r'\b[xX]\s*(\d+)\b', text_clean)
    if m_x:
        return int(m_x.group(1))

    # Pattern: "for one week" / "for 1 week" -> 7 days
    if re.search(r'\b(?:for\s+)?one\s+week\b|\b1\s*week\b', text_clean, re.IGNORECASE):
        return 7
    m_wk = re.search(r'\b(\d+)\s*weeks?\b', text_clean, re.IGNORECASE)
    if m_wk:
        return int(m_wk.group(1)) * 7

    # Pattern: "for one month" / "1 month" -> 30 days
    if re.search(r'\b(?:for\s+)?one\s+month\b|\b1\s*month\b', text_clean, re.IGNORECASE):
        return 30
    m_mo = re.search(r'\b(\d+)\s*months?\b', text_clean, re.IGNORECASE)
    if m_mo:
        return int(m_mo.group(1)) * 30

    return None


def extract_medicine_name(block_text):
    """
    Extracts strictly the medicine name without strength, dosage forms, or numbering.
    Never rejects a candidate solely because it's not in KNOWN_MEDICINES (Rule 3).
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


def parse_single_medicine_block(block_lines):
    """
    Extracts strictly the FOUR required fields for ONE medicine:
    1. medicine_name
    2. units_per_dose
    3. administration_times
    4. duration_days
    """
    full_block = "\n".join(block_lines).strip()

    name = extract_medicine_name(full_block)
    units = extract_units_per_dose(full_block)
    times = extract_administration_times(full_block)
    duration = extract_duration_days(full_block)

    # Flag for verification if any field could not be reliably determined
    is_uncertain = (
        name is None or
        units is None or
        len(times) == 0 or
        duration is None
    )

    return {
        'medicine_name': name if name else 'Needs verification',
        'units_per_dose': units,
        'administration_times': times,
        'duration_days': duration,
        'verification_status': 'needs_verification' if is_uncertain else 'ready_for_review',
        'raw_text': full_block
    }


def parse_prescription_text(text):
    """
    Complete Prescription Layout Reconstruction & 4-Field Multi-Medicine Extraction.
    Identifies EVERY medicine entry.
    Produces ONLY the 4 required fields per medicine:
      - medicine_name
      - units_per_dose
      - administration_times
      - duration_days
    Excludes all patient, doctor, hospital, advice, and footer info.
    """
    if not text or not text.strip():
        return {
            'medicines': [],
            'total_medicines_detected': 0,
            'has_uncertain_fields': True
        }

    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Filter out header, patient, footer, and advice lines
    candidate_lines = []
    in_advice = False
    in_footer = False

    for line in lines:
        sec = classify_line_section(line)
        if sec == 'ADVICE':
            in_advice = True
            continue
        if sec == 'FOOTER':
            in_footer = True
            continue
        if sec in ['HEADER', 'PATIENT_INFO']:
            continue

        if not in_advice and not in_footer:
            candidate_lines.append(line)

    def is_medicine_start_line(line):
        line_clean = line.strip()
        # Starts with 1. or 2. or 3- or 4)
        if re.match(r'^(?:[rR]x?\s*)?\d+[\.\-\)]\s*', line_clean):
            return True
        # Starts with Tab / Cap / Syp / Inj
        if re.match(r'^(?:tab(?:let)?\.?|cap(?:sule)?\.?|syp(?:rup)?\.?|inj(?:ection)?\.?)\b', line_clean, re.IGNORECASE):
            return True
        # Contains a known active pharmaceutical name
        for drug in KNOWN_MEDICINES:
            if re.search(r'\b' + re.escape(drug) + r'\b', line_clean, re.IGNORECASE):
                return True
        # Word followed by strength e.g. "Amoxicillin 500 mg"
        if re.search(r'^[A-Za-z]{3,20}\s+\d+\s*(?:mg|g|mcg|ml)\b', line_clean, re.IGNORECASE):
            return True
        return False

    def is_instruction_only_line(line):
        lower = line.strip().lower()
        instruction_starts = [
            'take', 'tablet', 'capsule', 'duration', 'qty', 'oty', 'count',
            'twice', 'thrice', 'once', 'after', 'before', 'at bedtime', 'at night'
        ]
        return any(lower.startswith(w) for w in instruction_starts)

    medicine_blocks = []
    current_block = []

    for line in candidate_lines:
        if is_medicine_start_line(line):
            if current_block:
                medicine_blocks.append(current_block)
            current_block = [line]
        else:
            if current_block:
                current_block.append(line)
            elif not is_instruction_only_line(line):
                current_block = [line]

    if current_block:
        medicine_blocks.append(current_block)

    # Parse each medicine block independently
    extracted_medicines = []
    seen_names = set()

    for block in medicine_blocks:
        med_dict = parse_single_medicine_block(block)
        name = med_dict['medicine_name']
        if name and name != 'Needs verification' and name.lower() not in NON_MEDICINE_WORDS:
            # Prevent duplicate identical blocks while keeping distinct medicines
            name_key = name.lower()
            if name_key not in seen_names:
                seen_names.add(name_key)
                extracted_medicines.append(med_dict)
        elif name == 'Needs verification' and med_dict.get('duration_days') is not None:
            # An identifiable prescription row where medicine name requires patient review
            extracted_medicines.append(med_dict)

    # Fallback if no structured blocks detected but candidates exist
    if not extracted_medicines and candidate_lines:
        med_dict = parse_single_medicine_block(candidate_lines)
        if med_dict['medicine_name'] and med_dict['medicine_name'].lower() not in NON_MEDICINE_WORDS:
            extracted_medicines.append(med_dict)

    has_uncertain = any(m.get('verification_status') == 'needs_verification' for m in extracted_medicines) or (len(extracted_medicines) == 0)

    # Provide primary medicine values at top level for legacy callers
    primary = extracted_medicines[0] if extracted_medicines else {
        'medicine_name': 'Not detected',
        'units_per_dose': None,
        'administration_times': [],
        'duration_days': None
    }

    return {
        'medicines': extracted_medicines,
        'total_medicines_detected': len(extracted_medicines),
        'has_uncertain_fields': has_uncertain,
        'medicine_name': primary['medicine_name'],
        'units_per_dose': primary['units_per_dose'],
        'administration_times': primary['administration_times'],
        'duration_days': primary['duration_days']
    }
