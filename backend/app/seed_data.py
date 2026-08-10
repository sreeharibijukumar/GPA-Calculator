from sqlalchemy.orm import Session
from app.models import Course, Regulation, CourseSemester, CourseSubject

SEED_COURSES = [
    {
        "code": "CSE",
        "name": "Computer Science and Engineering",
        "regulations": {
            "R23": {
                1: [  # I Year I Semester
                    {"code": "23A52201T", "name": "Communicative English", "credits": 2, "aliases": "CE, ENG"},
                    {"code": "23A51202T", "name": "Chemistry", "credits": 3, "aliases": "CHE"},
                    {"code": "23A54101", "name": "Linear Algebra & Calculus", "credits": 3, "aliases": "LAC, M1"},
                    {"code": "23A01201T", "name": "Basic Civil & Mechanical Engineering", "credits": 3, "aliases": "BCME"},
                    {"code": "23A05101T", "name": "Introduction to Programming", "credits": 3, "aliases": "ITP"},
                    {"code": "23A52201P", "name": "Communicative English Lab", "credits": 1, "aliases": "CE Lab"},
                    {"code": "23A51202P", "name": "Chemistry Lab", "credits": 1, "aliases": "CHE Lab"},
                    {"code": "23A03201", "name": "Engineering Workshop", "credits": 1.5, "aliases": "EW"},
                    {"code": "23A05101P", "name": "Computer Programming Lab", "credits": 1.5, "aliases": "CP Lab"},
                    {"code": "23A99201", "name": "Health and wellness, Yoga and Sports", "credits": 0.5, "aliases": "HWYS"},
                ],
                2: [  # I Year II Semester
                    {"code": "23A56101T", "name": "Engineering Physics", "credits": 3, "aliases": "EP"},
                    {"code": "23A54201", "name": "Differential Equations & Vector Calculus", "credits": 3, "aliases": "DEVC, M2"},
                    {"code": "23A02101T", "name": "Basic Electrical & Electronics Engineering", "credits": 3, "aliases": "BEEE"},
                    {"code": "23A03101T", "name": "Engineering Graphics", "credits": 3, "aliases": "EG"},
                    {"code": "23A05102", "name": "IT Workshop", "credits": 1, "aliases": "ITW"},
                    {"code": "23A05201T", "name": "Data Structures", "credits": 3, "aliases": "DS"},
                    {"code": "23A56101P", "name": "Engineering Physics Lab", "credits": 1, "aliases": "EP Lab"},
                    {"code": "23A02101P", "name": "Electrical & Electronics Engineering Workshop", "credits": 1.5, "aliases": "EEE"},
                    {"code": "23A05201P", "name": "Data Structures Lab", "credits": 1.5, "aliases": "DS Lab"},
                    {"code": "23A99101", "name": "NSS/NCC/Scouts & Guides/Community Service", "credits": 0.5, "aliases": "NSS, NCC"},
                ],
                3: [  # II Year I Semester
                    {"code": "23A54301", "name": "Discrete Mathematics & Graph Theory", "credits": 3, "aliases": "DMGT, M3"},
                    {"code": "23A52301", "name": "Universal Human Values 2- Understanding Harmony and Ethical human conduct", "credits": 3, "aliases": "UHV"},
                    {"code": "23A30402", "name": "Digital Logic and Computer Organization", "credits": 3, "aliases": "DLCO"},
                    {"code": "23A05302T", "name": "Advanced Data Structures & Algorithms Analysis", "credits": 3, "aliases": "ADSA"},
                    {"code": "23A05303T", "name": "Object-Oriented Programming Through JAVA", "credits": 3, "aliases": "OOPJ, JAVA"},
                    {"code": "23A05302P", "name": "Advanced Data Structures and Algorithms Analysis Lab", "credits": 1.5, "aliases": "ADSA Lab"},
                    {"code": "23A05303P", "name": "Object-Oriented Programming Through JAVA Lab", "credits": 1.5, "aliases": "JAVA Lab"},
                    {"code": "23A05304", "name": "Python programming", "credits": 2, "aliases": "Python"},
                    {"code": "23A99301", "name": "Environmental Science", "credits": 0, "aliases": "EVS"},
                ],
                4: [  # II Year II Semester
                    {"code": "23A52402a", "name": "Managerial Economics and Financial Analysis", "credits": 2, "aliases": "MEFA"},
                    {"code": "23A54401", "name": "Probability & Statistics", "credits": 3, "aliases": "PS, M4"},
                    {"code": "23A35401T", "name": "Operating Systems", "credits": 3, "aliases": "OS"},
                    {"code": "23A05402T", "name": "Database Management Systems", "credits": 3, "aliases": "DBMS"},
                    {"code": "23A05403", "name": "Software Engineering", "credits": 3, "aliases": "SE"},
                    {"code": "23A35401P", "name": "Operating Systems Lab", "credits": 1.5, "aliases": "OS Lab"},
                    {"code": "23A05402P", "name": "Database Management Systems Lab", "credits": 1.5, "aliases": "DBMS Lab"},
                    {"code": "23A05404", "name": "Full Stack Development - I", "credits": 2, "aliases": "FSD-1, FSD I"},
                    {"code": "23A99401", "name": "Design Thinking & Innovation", "credits": 0, "aliases": "DT"},
                ],
                5: [  # III Year I Semester
                    {"code": "23A31301T", "name": "Artificial Intelligence", "credits": 3, "aliases": "AI"},
                    {"code": "23A05501T", "name": "Computer Networks & Internet Protocols", "credits": 3, "aliases": "CN, CNIP"},
                    {"code": "23A05502", "name": "Automata Theory and Compiler Design", "credits": 3, "aliases": "ATCD, CD"},
                    {"code": "23A05503", "name": "Introduction To Quantum Technologies And Applications", "credits": 3, "aliases": "QTA"},
                    {"code": "23A05504a", "name": "Professional Elective-I (Object Oriented Analysis and Design)", "credits": 3, "aliases": "PE-1, OOAD"},
                    {"code": "23A03505", "name": "Open Elective-I (Sustainable Energy Technologies)", "credits": 3, "aliases": "OE-1, SET"},
                    {"code": "23A31301P", "name": "Artificial Intelligence Lab", "credits": 1.5, "aliases": "AI Lab"},
                    {"code": "23A05501P", "name": "Computer Networks & Internet Protocols Lab", "credits": 1.5, "aliases": "CN Lab"},
                    {"code": "23A05506", "name": "Full Stack Development - II", "credits": 2, "aliases": "FSD-2, FSD II"},
                    {"code": "23A03508", "name": "Tinkering Lab", "credits": 1, "aliases": "T Lab"},
                    {"code": "23A05507", "name": "Evaluation of Community Service Internship", "credits": 2, "aliases": "CSP, CSI"},
                ],
                6: [  # III Year II Semester
                    {"code": "23A31401T", "name": "Machine Learning", "credits": 3, "aliases": "ML"},
                    {"code": "23A37501T", "name": "Cloud Computing", "credits": 3, "aliases": "CC"},
                    {"code": "23A05601T", "name": "Cryptography & Network Security", "credits": 3, "aliases": "CNS"},
                    {"code": "23A38502", "name": "Professional Elective-II (Cyber Security)", "credits": 3, "aliases": "PE-2, ICS"},
                    {"code": "23A05603b", "name": "Professional Elective-III (Mobile Adhoc Networks)", "credits": 3, "aliases": "PE-3, MANET"},
                    {"code": "23A01606b", "name": "Open Elective-II (Sustainability Engineering Pratices)", "credits": 3, "aliases": "OE-2, SEP"},
                    {"code": "23A31401P", "name": "Machine Learning Lab", "credits": 1.5, "aliases": "ML Lab"},
                    {"code": "23A05601P", "name": "Cryptography & Network Security Lab", "credits": 1.5, "aliases": "CNS Lab"},
                    {"code": "23A52501", "name": "Soft skills", "credits": 2, "aliases": "SS"},
                    {"code": "23A52601", "name": "Technical Paper Writing & IPR", "credits": 0, "aliases": "TPW, IPR"},
                    {"code": "23A05604", "name": "Workshop", "credits": 0, "aliases": "WRK"},
                ],
                7: [  # IV Year I Semester
                    {"code": "23A30602T", "name": "Deep Learning", "credits": 3, "aliases": "DL"},
                    {"code": "23A52701a", "name": "Management Course- II (Business Ethics and Corporate Governance)", "credits": 2, "aliases": "MC-2, BECG"},
                    {"code": "23A35501T", "name": "Professional Elective-IV (Internet Of Things)", "credits": 3, "aliases": "PE-4, IOT"},
                    {"code": "23A05702a", "name": "Professional Elective-V (Agile Methodologies)", "credits": 3, "aliases": "PE-5, AGM"},
                    {"code": "23A02704", "name": "Open Elective-III (Smart Gird Technologies)", "credits": 3, "aliases": "OE-3, SGT"},
                    {"code": "23A01705b", "name": "Open Elective-IV (Solid Waste Management)", "credits": 3, "aliases": "OE-4, SWM"},
                    {"code": "23A05703", "name": "Skill Enhancement Course: Prompt Engineering", "credits": 2, "aliases": "PE Lab"},
                    {"code": "23A52702", "name": "Audit Course: Gender Sensitization", "credits": 0, "aliases": "Audit"},
                    {"code": "23A05704", "name": "Evaluation of Industry Internship", "credits": 2, "aliases": "Industry"},
                ],
                8: [  # IV Year II Semester
                    {"code": "23A05801", "name": "Internship", "credits": 4, "aliases": "Intern"},
                    {"code": "23A05802", "name": "Project", "credits": 8, "aliases": "Project"},
                ],
            },
            "R20": {
                1: [  # I Year I Semester
                    {"code": "20A54101", "name": "Linear Algebra and Calculus", "credits": 3, "aliases": "LAC, M1"},
                    {"code": "20A51101T", "name": "Chemistry", "credits": 3, "aliases": "CHE"},
                    {"code": "20A05201T", "name": "C-Programming & Data Structures", "credits": 3, "aliases": "CPDS"},
                    {"code": "20A02101T", "name": "Basic Electrical & Electronics Engineering", "credits": 3, "aliases": "BEEE"},
                    {"code": "20A03202", "name": "Engineering Workshop", "credits": 1.5, "aliases": "EWS"},
                    {"code": "20A05202", "name": "IT Workshop", "credits": 1.5, "aliases": "ITW"},
                    {"code": "20A51101P", "name": "Chemistry Lab", "credits": 1.5, "aliases": "CHE Lab"},
                    {"code": "20A05201P", "name": "C-Programming & Data Structures Lab", "credits": 1.5, "aliases": "CPDS Lab"},
                    {"code": "20A02101P", "name": "Basic Electrical & Electronics Engineering Lab", "credits": 1.5, "aliases": "BEEE Lab"},
                ],
                2: [  # I Year II Semester
                    {"code": "20A54202", "name": "Probability & Statistics", "credits": 3, "aliases": "PS, M2"},
                    {"code": "20A56201T", "name": "Applied Physics", "credits": 3, "aliases": "AP"},
                    {"code": "20A52101T", "name": "Communicative English", "credits": 3, "aliases": "CE, ENG"},
                    {"code": "20A05101T", "name": "Python Programming & Data Science", "credits": 3, "aliases": "PPDS, Python"},
                    {"code": "20A03101T", "name": "Engineering Drawing", "credits": 2, "aliases": "ED"},
                    {"code": "20A03101P", "name": "Engineering Graphics Lab", "credits": 1, "aliases": "EG Lab"},
                    {"code": "20A52101P", "name": "Communicative English Lab", "credits": 1.5, "aliases": "CE Lab, ENG Lab"},
                    {"code": "20A56201P", "name": "Applied Physics Lab", "credits": 1.5, "aliases": "AP Lab"},
                    {"code": "20A05101P", "name": "Python Programming & Data Science Lab", "credits": 1.5, "aliases": "PPDS Lab"},
                ],
                3: [  # II Year I Semester
                    {"code": "20A54304", "name": "Discrete Mathematics & Graph Theory", "credits": 3, "aliases": "DMGT, M3"},
                    {"code": "20A04304T", "name": "Digital Electronics & Microprocessors", "credits": 3, "aliases": "DEMP"},
                    {"code": "20A05301T", "name": "Advanced Data Structures & Algorithms", "credits": 3, "aliases": "ADSA"},
                    {"code": "20A05302T", "name": "Object Oriented Programming Through Java", "credits": 3, "aliases": "OOPJ, Java"},
                    {"code": "20A05303", "name": "Computer Organization", "credits": 3, "aliases": "CO"},
                    {"code": "20A04304P", "name": "Digital Electronics & Microprocessors Lab", "credits": 1.5, "aliases": "DEMP Lab"},
                    {"code": "20A05301P", "name": "Advanced Data Structures and Algorithms Lab", "credits": 1.5, "aliases": "ADSA Lab"},
                    {"code": "20A05302P", "name": "Object Oriented Programming Through Java Lab", "credits": 1.5, "aliases": "Java Lab"},
                    {"code": "20A52201", "name": "Universal Human Values", "credits": 3, "aliases": "UHV"},
                    {"code": "20A05304", "name": "Skill Oriented Course – I (Web Application Development)", "credits": 2, "aliases": "WAD, SOC-1"},
                ],
                4: [  # II Year II Semester
                    {"code": "20A54404", "name": "Deterministic & Stochastic Statistical Methods", "credits": 3, "aliases": "DSSM, M4"},
                    {"code": "20A05401T", "name": "Database Management Systems", "credits": 3, "aliases": "DBMS"},
                    {"code": "20A05402T", "name": "Operating Systems", "credits": 3, "aliases": "OS"},
                    {"code": "20A05403T", "name": "Software Engineering", "credits": 3, "aliases": "SE"},
                    {"code": "20A52301", "name": "Humanities Elective– I (Managerial Economics & Financial Analysis)", "credits": 3, "aliases": "MEFA, HE-1"},
                    {"code": "20A05401P", "name": "Database Management Systems Lab", "credits": 1.5, "aliases": "DBMS Lab"},
                    {"code": "20A05402P", "name": "Operating Systems Lab", "credits": 1.5, "aliases": "OS Lab"},
                    {"code": "20A05403P", "name": "Software Engineering Lab", "credits": 1.5, "aliases": "SE Lab"},
                    {"code": "20A05404", "name": "Skill Oriented Course– II (Exploratory Data Analysis with R)", "credits": 2, "aliases": "EDA-R, SOC-2"},
                    {"code": "20A99401", "name": "Mandatory Non-Credit Course: Design Thinking for Innovation", "credits": 0, "aliases": "DT, DTI"},
                    {"code": "20A99301", "name": "NSS/NCC/NSO Activities", "credits": 0, "aliases": "NSS, NCC"},
                ],
                5: [  # III Year I Semester
                    {"code": "20A05501T", "name": "Computer Networks", "credits": 3, "aliases": "CN"},
                    {"code": "20A05502T", "name": "Artificial Intelligence", "credits": 3, "aliases": "AI"},
                    {"code": "20A05503", "name": "Formal Languages and Automata Theory", "credits": 3, "aliases": "FLAT"},
                    {"code": "20A05504a", "name": "Professional Elective Course – I (Software Project Management)", "credits": 3, "aliases": "PE-1, SPM"},
                    {"code": "20A01505", "name": "Open Elective Course – I (Building Technology)", "credits": 3, "aliases": "OE-1, BT"},
                    {"code": "20A05501P", "name": "Computer Networks Lab", "credits": 1.5, "aliases": "CN Lab"},
                    {"code": "20A05502P", "name": "Artificial Intelligence Lab", "credits": 1.5, "aliases": "AI Lab"},
                    {"code": "20A05506", "name": "Skill Oriented Course – III (Advanced Web Application Development)", "credits": 2, "aliases": "AWAD, SOC-3"},
                    {"code": "20A05507", "name": "Evaluation of Community Service Project", "credits": 1.5, "aliases": "CSP"},
                    {"code": "20A99201", "name": "Mandatory Non-Credit Course: Environmental Science", "credits": 0, "aliases": "ES, EVS"},
                ],
                6: [  # III Year II Semester
                    {"code": "20A05601T", "name": "Compiler Design", "credits": 3, "aliases": "CD"},
                    {"code": "20A05602T", "name": "Machine Learning", "credits": 3, "aliases": "ML"},
                    {"code": "20A05603T", "name": "Internet of Things", "credits": 3, "aliases": "IoT"},
                    {"code": "20A05604a", "name": "Professional Elective Course– II (Software Testing)", "credits": 3, "aliases": "PE-2, ST"},
                    {"code": "20A01605", "name": "Open Elective Course – II (Environmental Economics)", "credits": 3, "aliases": "OE-2, EE"},
                    {"code": "20A05601P", "name": "Compiler Design Lab", "credits": 1.5, "aliases": "CD Lab"},
                    {"code": "20A05602P", "name": "Machine Learning Lab", "credits": 1.5, "aliases": "ML Lab"},
                    {"code": "20A05603P", "name": "Internet of Things Lab", "credits": 1.5, "aliases": "IoT Lab"},
                    {"code": "20A52401", "name": "Skill Oriented Course - IV (Soft Skills)", "credits": 2, "aliases": "SS, SOC-4"},
                    {"code": "20A99601", "name": "Mandatory Non-Credit Course: Intellectual Property Rights & Patents", "credits": 0, "aliases": "IPR"},
                ],
                7: [  # IV Year I Semester
                    {"code": "20A05701a", "name": "Professional Elective Course– III (Cloud Computing)", "credits": 3, "aliases": "PE-3, CC"},
                    {"code": "20A05702a", "name": "Professional Elective Course– IV (Fundamentals of AR/VR)", "credits": 3, "aliases": "PE-4, ARVR"},
                    {"code": "20A05703a", "name": "Professional Elective Course– V (Full Stack Development)", "credits": 3, "aliases": "PE-5, FSD"},
                    {"code": "20A52701a", "name": "Humanities Elective – II (Entrepreneurship and Incubation)", "credits": 3, "aliases": "HE-2, EI"},
                    {"code": "20A01704", "name": "Open Elective Course – III (Cost Effective Housing Techniques)", "credits": 3, "aliases": "OE-3"},
                    {"code": "20A01705", "name": "Open Elective Course – IV (Health, Safety & Environmental Management)", "credits": 3, "aliases": "OE-4"},
                    {"code": "20A05706", "name": "Skill Oriented Course – V (Mobile Application Development)", "credits": 2, "aliases": "MAD, SOC-5"},
                    {"code": "20A05707", "name": "Evaluation of Industry Internship", "credits": 3, "aliases": "Industry"},
                ],
                8: [  # IV Year II Semester
                    {"code": "20A05801", "name": "Full Internship & Project work", "credits": 12, "aliases": "Project"},
                ],
            },
        },
    },
    {
        "code": "ECE",
        "name": "Electronics and Communication Engineering",
        "regulations": {
            "R23": {
                1: [  # I Year I Semester
                    {"code": "23A56101T", "name": "Engineering Physics", "credits": 3, "aliases": "EP"},
                    {"code": "23A54101", "name": "Linear Algebra & Calculus", "credits": 3, "aliases": "LAC, M1"},
                    {"code": "23A02101T", "name": "Basic Electrical & Electronics Engineering", "credits": 3, "aliases": "BEEE"},
                    {"code": "23A03101T", "name": "Engineering Graphics", "credits": 3, "aliases": "EG"},
                    {"code": "23A05101T", "name": "Introduction to Programming", "credits": 3, "aliases": "ITP"},
                    {"code": "23A05102", "name": "IT Workshop", "credits": 1, "aliases": "ITW"},
                    {"code": "23A56101P", "name": "Engineering Physics Lab", "credits": 1, "aliases": "EP Lab"},
                    {"code": "23A02101P", "name": "Electrical & Electronics Engineering Workshop", "credits": 1.5, "aliases": "EEE Workshop"},
                    {"code": "23A05101P", "name": "Computer Programming Lab", "credits": 1.5, "aliases": "CP Lab"},
                    {"code": "23A99101", "name": "NSS/NCC/Scouts & Guides/Community Service", "credits": 0.5, "aliases": "NSS, NCC"},
                ],
                2: [  # I Year II Semester
                    {"code": "23A52201T", "name": "Communicative English", "credits": 2, "aliases": "CE"},
                    {"code": "23A51202T", "name": "Chemistry", "credits": 3, "aliases": "CHE"},
                    {"code": "23A54201", "name": "Differential Equations & Vector Calculus", "credits": 3, "aliases": "DEVC, M2"},
                    {"code": "23A01201T", "name": "Basic Civil & Mechanical Engineering", "credits": 3, "aliases": "BCME"},
                    {"code": "23A04201T", "name": "Network Analysis", "credits": 3, "aliases": "NA"},
                    {"code": "23A52201P", "name": "Communicative English Lab", "credits": 1, "aliases": "CE Lab"},
                    {"code": "23A51202P", "name": "Chemistry Lab", "credits": 1, "aliases": "CHE Lab"},
                    {"code": "23A03201", "name": "Engineering Workshop", "credits": 1.5, "aliases": "EW"},
                    {"code": "23A04201P", "name": "Network Analysis And Simulation Laboratory", "credits": 1.5, "aliases": "NA Lab"},
                    {"code": "23A99201", "name": "Health and wellness, Yoga and Sports", "credits": 0.5, "aliases": "HWYS"},
                ],
                3: [  # II Year I Semester
                    {"code": "23A54302", "name": "Probability and Complex Variables", "credits": 3, "aliases": "PCV, M3"},
                    {"code": "23A52301", "name": "Universal Human Values– Understanding Harmony and Ethical Human Conduct", "credits": 3, "aliases": "UHV"},
                    {"code": "23A04301", "name": "Signals, Systems and Stochastic Processes", "credits": 3, "aliases": "SSSP"},
                    {"code": "23A04302T", "name": "Electronic Devices and Circuits", "credits": 3, "aliases": "EDC"},
                    {"code": "23A04303T", "name": "Digital Circuits Design", "credits": 3, "aliases": "DCD"},
                    {"code": "23A04302P", "name": "Electronic Devices and Circuits Lab", "credits": 1.5, "aliases": "EDC Lab"},
                    {"code": "23A04303P", "name": "Digital Circuits & Signal Simulation Lab", "credits": 1.5, "aliases": "DCSS Lab"},
                    {"code": "23A05304", "name": "Python Programming", "credits": 2, "aliases": "Python"},
                    {"code": "23A99301", "name": "Environmental Science", "credits": 0, "aliases": "EVS"},
                ],
                4: [  # II Year II Semester
                    {"code": "23A52402a", "name": "Managerial Economics and Financial Analysis", "credits": 2, "aliases": "MEFA"},
                    {"code": "23A04401", "name": "Linear Control Systems", "credits": 3, "aliases": "LCS"},
                    {"code": "23A04402", "name": "EM Waves and Transmission Lines", "credits": 3, "aliases": "EMWTL"},
                    {"code": "23A04403T", "name": "Electronic Circuits Analysis", "credits": 3, "aliases": "ECA"},
                    {"code": "23A04404T", "name": "Analog and Digital Communications", "credits": 3, "aliases": "ADC"},
                    {"code": "23A04403P", "name": "Electronic Circuits Analysis Lab", "credits": 1.5, "aliases": "ECA Lab"},
                    {"code": "23A04404P", "name": "Analog and Digital Communications Lab", "credits": 1.5, "aliases": "ADC Lab"},
                    {"code": "23A52403", "name": "Soft Skills", "credits": 2, "aliases": "SS"},
                    {"code": "23A99401", "name": "Design Thinking and Innovation", "credits": 2, "aliases": "DT"},
                ],
                5: [  # III Year I Semester
                    {"code": "23A04501T", "name": "Analog and Digital IC Applications", "credits": 3, "aliases": "ADICA"},
                    {"code": "23A04502", "name": "Antennas & Wave Propagation", "credits": 3, "aliases": "AWP"},
                    {"code": "23A04503T", "name": "Microprocessors and Microcontrollers", "credits": 3, "aliases": "MPMC"},
                    {"code": "23A05503", "name": "Introduction To Quantum Technologies And Applications", "credits": 3, "aliases": "QTA"},
                    {"code": "23A04504a", "name": "Professional Elective-I (Computer Architecture & Organization)", "credits": 3, "aliases": "PE-1, CAO"},
                    {"code": "23A01505a", "name": "Open Elective-I (Green Buildings)", "credits": 3, "aliases": "OE-1"},
                    {"code": "23A04501P", "name": "Analog & Digital IC Applications Lab", "credits": 1.5, "aliases": "ADICA Lab"},
                    {"code": "23A04503P", "name": "Microprocessors and Microcontrollers Lab", "credits": 1.5, "aliases": "MPMC Lab"},
                    {"code": "23A04506", "name": "Skill Enhancement course: PCB Design and Prototype development", "credits": 2, "aliases": "PCB"},
                    {"code": "23A03508", "name": "Tinkering Lab", "credits": 1, "aliases": "T Lab"},
                    {"code": "23A04507", "name": "Evaluation of Community Service Internship", "credits": 2, "aliases": "CSI"},
                ],
                6: [  # III Year II Semester
                    {"code": "23A04601", "name": "Digital Signal Processing", "credits": 3, "aliases": "DSP"},
                    {"code": "23A04602T", "name": "Microwave and Optical Communications", "credits": 3, "aliases": "MOC"},
                    {"code": "23A04603T", "name": "VLSI Design", "credits": 3, "aliases": "VLSI"},
                    {"code": "23A04604a", "name": "Professional Elective-II (Electronic Measurements and Instrumentation)", "credits": 3, "aliases": "PE-2, EMI"},
                    {"code": "23A04605a", "name": "Professional Elective-III (Digital Image Processing)", "credits": 3, "aliases": "PE-3, DIP"},
                    {"code": "23A01606a", "name": "Open Elective-II (Disaster Management)", "credits": 3, "aliases": "OE-2"},
                    {"code": "23A04602P", "name": "Microwave and Optical Communications Lab", "credits": 1.5, "aliases": "MOC Lab"},
                    {"code": "23A04603P", "name": "VLSI Design Lab", "credits": 1.5, "aliases": "VLSI Lab"},
                    {"code": "23A04607", "name": "Skill Enhancement course: Machine Learning and DSP", "credits": 2, "aliases": "ML DSP"},
                    {"code": "23A52601", "name": "Technical Paper Writing & IPR", "credits": 0, "aliases": "TPW"},
                    {"code": "23A04608", "name": "Workshop", "credits": 0, "aliases": "WRK"},
                ],
                7: [  # IV Year I Semester
                    {"code": "23A04701", "name": "Data Communications and Networking", "credits": 3, "aliases": "DCN"},
                    {"code": "23A52701a", "name": "Management Course-II (Business Ethics and Corporate Governance)", "credits": 2, "aliases": "MC-2, BECG"},
                    {"code": "23A04702a", "name": "Professional Elective-IV (Radar Engineering)", "credits": 3, "aliases": "PE-4, RE"},
                    {"code": "23A04703a", "name": "Professional Elective-V (Low Power VLSI Design)", "credits": 3, "aliases": "PE-5, LPVLSI"},
                    {"code": "23A01704a", "name": "Open Elective-III (Building Materials and Services)", "credits": 3, "aliases": "OE-3"},
                    {"code": "23A01704b", "name": "Open Elective-IV (Environmental Impact Assessment)", "credits": 3, "aliases": "OE-4"},
                    {"code": "23A04705a", "name": "Skill Enhancement course: RF System Design tools", "credits": 2, "aliases": "RF Tools"},
                    {"code": "23A52702", "name": "Audit Course: Gender Sensitization", "credits": 0, "aliases": "GS"},
                    {"code": "23A04706", "name": "Evaluation of Industry Internship", "credits": 2, "aliases": "Industry Internship"},
                ],
                8: [  # IV Year II Semester
                    {"code": "23A04801", "name": "Internship", "credits": 4, "aliases": "Intern"},
                    {"code": "23A04802", "name": "Project", "credits": 8, "aliases": "Project"},
                ],
            },
        },
    },
    {
        "code": "AIML",
        "name": "Artificial Intelligence and Machine Learning",
        "regulations": {
            "R23": {
                1: [  # I Year I Semester
                    {"code": "23A56101T", "name": "Engineering Physics", "credits": 3, "aliases": "EP"},
                    {"code": "23A54101", "name": "Linear Algebra & Calculus", "credits": 3, "aliases": "LAC, M1"},
                    {"code": "23A02101T", "name": "Basic Electrical & Electronics Engineering", "credits": 3, "aliases": "BEEE"},
                    {"code": "23A03101T", "name": "Engineering Graphics", "credits": 3, "aliases": "EG"},
                    {"code": "23A05101T", "name": "Introduction to Programming", "credits": 3, "aliases": "ITP"},
                    {"code": "23A05102", "name": "IT Workshop", "credits": 1, "aliases": "ITW"},
                    {"code": "23A56101P", "name": "Engineering Physics Lab", "credits": 1, "aliases": "EP Lab"},
                    {"code": "23A02101P", "name": "Electrical & Electronics Engineering Workshop", "credits": 1.5, "aliases": "EEE Workshop"},
                    {"code": "23A05101P", "name": "Computer Programming Lab", "credits": 1.5, "aliases": "CP Lab"},
                    {"code": "23A99101", "name": "NSS/NCC/Scouts & Guides/Community Service", "credits": 0.5, "aliases": "NSS, NCC"},
                ],
                2: [  # I Year II Semester
                    {"code": "23A52201T", "name": "Communicative English", "credits": 2, "aliases": "CE"},
                    {"code": "23A51202T", "name": "Chemistry", "credits": 3, "aliases": "CHE"},
                    {"code": "23A54201", "name": "Differential Equations & Vector Calculus", "credits": 3, "aliases": "DEVC, M2"},
                    {"code": "23A01201T", "name": "Basic Civil & Mechanical Engineering", "credits": 3, "aliases": "BCME"},
                    {"code": "23A05201T", "name": "Data Structures", "credits": 3, "aliases": "DS"},
                    {"code": "23A52201P", "name": "Communicative English Lab", "credits": 1, "aliases": "CE Lab"},
                    {"code": "23A51202P", "name": "Chemistry Lab", "credits": 1, "aliases": "CHE Lab"},
                    {"code": "23A03201", "name": "Engineering Workshop", "credits": 1.5, "aliases": "EW"},
                    {"code": "23A05201P", "name": "Data Structures Lab", "credits": 1.5, "aliases": "DS Lab"},
                    {"code": "23A99201", "name": "Health and wellness, Yoga and Sports", "credits": 0.5, "aliases": "HWYS"},
                ],
                3: [  # II Year I Semester
                    {"code": "23A54301", "name": "Discrete Mathematics & Graph Theory", "credits": 3, "aliases": "DMGT, M3"},
                    {"code": "23A52301", "name": "Universal Human Values 2- Understanding Harmony and Ethical human conduct", "credits": 3, "aliases": "UHV"},
                    {"code": "23A31301T", "name": "Artificial Intelligence", "credits": 3, "aliases": "AI"},
                    {"code": "23A05302T", "name": "Advanced Data Structures & Algorithms Analysis", "credits": 3, "aliases": "ADSA"},
                    {"code": "23A05303T", "name": "Object-Oriented Programming Through JAVA", "credits": 3, "aliases": "OOPJ, Java"},
                    {"code": "23A05302P", "name": "Advanced Data Structures and Algorithms Analysis Lab", "credits": 1.5, "aliases": "ADSA Lab"},
                    {"code": "23A05303P", "name": "Object-Oriented Programming Through JAVA Lab", "credits": 1.5, "aliases": "Java Lab"},
                    {"code": "23A05304", "name": "Python programming", "credits": 2, "aliases": "Python"},
                    {"code": "23A99301", "name": "Environmental Science", "credits": 0, "aliases": "EVS"},
                ],
                4: [  # II Year II Semester
                    {"code": "23A52402e", "name": "Optimization Techniques", "credits": 2, "aliases": "OPT"},
                    {"code": "23A54401", "name": "Probability & Statistics", "credits": 3, "aliases": "PS, M4"},
                    {"code": "23A31401T", "name": "Machine Learning", "credits": 3, "aliases": "ML"},
                    {"code": "23A05402T", "name": "Database Management Systems", "credits": 3, "aliases": "DBMS"},
                    {"code": "23A30402", "name": "Digital Logic and Computer Organization", "credits": 3, "aliases": "DLCO"},
                    {"code": "23A31403", "name": "AI & ML Lab", "credits": 1.5, "aliases": "AI ML Lab"},
                    {"code": "23A05402P", "name": "Database Management Systems Lab", "credits": 1.5, "aliases": "DBMS Lab"},
                    {"code": "23A52401", "name": "Full Stack Development-1", "credits": 2, "aliases": "FSD-1"},
                    {"code": "23A99401", "name": "Design Thinking & Innovation", "credits": 2, "aliases": "DT"},
                ],
                5: [  # III Year I Semester
                    {"code": "23A39501", "name": "Applied Machine Learning", "credits": 3, "aliases": "AML"},
                    {"code": "23A39502", "name": "Data Wrangling & Preprocessing", "credits": 3, "aliases": "DWP"},
                    {"code": "23A31501", "name": "Natural Language Processing", "credits": 3, "aliases": "NLP"},
                    {"code": "23A05503", "name": "Introduction To Quantum Technologies And Applications", "credits": 3, "aliases": "QTA"},
                    {"code": "23A30503a", "name": "Professional Elective-I (Data Visualization)", "credits": 3, "aliases": "PE-1, DV"},
                    {"code": "23A01505a", "name": "Open Elective- I (Green Buildings)", "credits": 3, "aliases": "OE-1"},
                    {"code": "23A39504", "name": "Machine Learning & NLP Lab", "credits": 1.5, "aliases": "ML NLP Lab"},
                    {"code": "23A39505", "name": "Data Wrangling Lab", "credits": 1.5, "aliases": "DW Lab"},
                    {"code": "23A05506", "name": "Skill Enhancement course: Full Stack Development – II", "credits": 2, "aliases": "FSD-2"},
                    {"code": "23A03508", "name": "Tinkering Lab", "credits": 1, "aliases": "T Lab"},
                    {"code": "23A39506", "name": "Community Service Internship", "credits": 2, "aliases": "CSI"},
                ],
                6: [  # III Year II Semester
                    {"code": "23A39601", "name": "Advanced Machine Learning", "credits": 3, "aliases": "Adv ML"},
                    {"code": "23A31702a", "name": "Explainable AI & Model Interpretability", "credits": 3, "aliases": "XAI"},
                    {"code": "23A39602", "name": "AI for Edge Computing", "credits": 3, "aliases": "AI Edge"},
                    {"code": "23A31603a", "name": "Professional Elective-II (Graph Neural Networks)", "credits": 3, "aliases": "PE-2, GNN"},
                    {"code": "23A32603", "name": "Professional Elective-III (Introduction to Quantum Computing)", "credits": 3, "aliases": "PE-3, QC"},
                    {"code": "23A01606a", "name": "Open Elective – II (Disaster Management)", "credits": 3, "aliases": "OE-2"},
                    {"code": "23A39604", "name": "ML Model Optimization Lab", "credits": 1.5, "aliases": "MLOpt Lab"},
                    {"code": "23A39605", "name": "Edge Computing Lab", "credits": 1.5, "aliases": "Edge Lab"},
                    {"code": "23A52501", "name": "Skill Enhancement course: Soft Skills", "credits": 2, "aliases": "SS"},
                    {"code": "23A52601", "name": "Audit Course: Technical Paper Writing & IPR", "credits": 0, "aliases": "TPW"},
                    {"code": "23A39606", "name": "Workshop", "credits": 0, "aliases": "WRK"},
                ],
                7: [  # IV Year I Semester
                    {"code": "23A31701", "name": "Generative AI & Prompt Engineering", "credits": 3, "aliases": "GenAI"},
                    {"code": "23A52701a", "name": "Management Course- II (Business Ethics and Corporate Governance)", "credits": 2, "aliases": "MC-2, BECG"},
                    {"code": "23A31702b", "name": "Professional Elective-IV (AI for Robotics)", "credits": 3, "aliases": "PE-4, AIR"},
                    {"code": "23A39702", "name": "Professional Elective-V (Smart Systems)", "credits": 3, "aliases": "PE-5, SS"},
                    {"code": "23A01704a", "name": "Open Elective-III (Building Materials and Services)", "credits": 3, "aliases": "OE-3"},
                    {"code": "23A01704b", "name": "Open Elective-IV (Environmental Impact Assessment)", "credits": 3, "aliases": "OE-4"},
                    {"code": "23A05703", "name": "Skill Enhancement Course: Prompt Engineering", "credits": 2, "aliases": "PE Lab"},
                    {"code": "23A52702", "name": "Audit Course: Gender Sensitization", "credits": 0, "aliases": "GS"},
                    {"code": "23A39703", "name": "Evaluation of Industry Internship", "credits": 2, "aliases": "Industry Internship"},
                ],
                8: [  # IV Year II Semester
                    {"code": "23A39801", "name": "Internship", "credits": 4, "aliases": "Intern"},
                    {"code": "23A39802", "name": "Project", "credits": 8, "aliases": "Project"},
                ],
            },
        },
    },
]

def seed_course_structure(db: Session) -> None:
    for course_data in SEED_COURSES:
        course = db.query(Course).filter(Course.code == course_data["code"]).first()
        if course is None:
            course = Course(code=course_data["code"], name=course_data["name"])
            db.add(course)
            db.flush()

        for reg_code, semesters in course_data["regulations"].items():
            regulation = (
                db.query(Regulation)
                .filter(Regulation.course_id == course.id, Regulation.code == reg_code)
                .first()
            )
            if regulation is None:
                regulation = Regulation(course_id=course.id, code=reg_code)
                db.add(regulation)
                db.flush()

            for sem_number, subjects in semesters.items():
                course_semester = (
                    db.query(CourseSemester)
                    .filter(
                        CourseSemester.regulation_id == regulation.id,
                        CourseSemester.semester_number == sem_number,
                    )
                    .first()
                )
                if course_semester is None:
                    course_semester = CourseSemester(regulation_id=regulation.id, semester_number=sem_number)
                    db.add(course_semester)
                    db.flush()

                for subj in subjects:
                    exists = (
                        db.query(CourseSubject)
                        .filter(
                            CourseSubject.course_semester_id == course_semester.id,
                            CourseSubject.code == subj["code"],
                        )
                        .first()
                    )
                    if exists is None:
                        db.add(CourseSubject(
                            course_semester_id=course_semester.id,
                            code=subj["code"],
                            name=subj["name"],
                            credits=subj["credits"],
                            aliases=subj.get("aliases"),
                        ))
    db.commit()