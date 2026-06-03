

from intent_router import classify_intent, route_to_service, Intent


TEST_MESSAGES = [

    # --- Musculation ---
    ("exercice pour les biceps",                "fr",  Intent.MUSCULATION),
    ("3tini tmrin l sder",                      "darija", Intent.MUSCULATION),
    ("ما هو أفضل تمرين للظهر؟",                "ar",  Intent.MUSCULATION),
    ("best exercise for chest",                 "en",  Intent.MUSCULATION),

    # --- Nutrition ---
    ("combien de protéines par jour?",          "fr",  Intent.NUTRITION),
    ("chhal protein khas nakol f nhar",         "darija", Intent.NUTRITION),
    ("كم بروتين يجب أن آكل يومياً",             "ar",  Intent.NUTRITION),
    ("how much protein should I eat",           "en",  Intent.NUTRITION),

    # --- Calories ---
    ("je veux perdre 5kg calculer mes calories","fr",  Intent.CALORIES),
    ("bghit nkhes 10 kilo, chhal kcal khasni",  "darija", Intent.CALORIES),
    ("أريد حساب السعرات الحرارية اليومية",       "ar",  Intent.CALORIES),
    ("calculate my daily calories to lose weight","en", Intent.CALORIES),

    # --- Planning ---
    ("crée moi un programme de 5 jours",        "fr",  Intent.PLANNING),
    ("3tini planning dyal sbi3 kamle",           "darija", Intent.PLANNING),
    ("أريد برنامج تدريبي لمدة أسبوع",            "ar",  Intent.PLANNING),
    ("give me a 6 day workout split",            "en",  Intent.PLANNING),

    # --- Progress ---
    ("montre moi mes résultats cette semaine",  "fr",  Intent.PROGRESS),
    ("bghit nchof ta9adomi",                    "darija", Intent.PROGRESS),
    ("أريد رؤية تقدمي",                          "ar",  Intent.PROGRESS),
    ("show me my progress",                     "en",  Intent.PROGRESS),

    # --- Cardio ---
    ("exercices cardio pour brûler des graisses","fr", Intent.CARDIO),
    ("cardio bach nhre9 dhn",                   "darija", Intent.CARDIO),
    ("تمارين كارديو لحرق الدهون",               "ar",  Intent.CARDIO),
    ("best cardio for fat loss",                "en",  Intent.CARDIO),

    # --- Greeting ---
    ("bonjour!",                                "fr",  Intent.GREETING),
    ("salam labas",                             "darija", Intent.GREETING),
    ("مرحبا",                                   "ar",  Intent.GREETING),
    ("hello!",                                  "en",  Intent.GREETING),
]



def run_tests():
    passed = 0
    failed = 0
    total  = len(TEST_MESSAGES)

    print("=" * 65)
    print("  INTENT ROUTER — TESTS MULTILINGUES")
    print("=" * 65)

    for msg, expected_lang, expected_intent in TEST_MESSAGES:
        result = classify_intent(msg)
        route  = route_to_service(result)

        ok_intent = result.intent == expected_intent
        ok_lang   = result.language == expected_lang

        status = "working" if (ok_intent and ok_lang) else "not working"

        if ok_intent and ok_lang:
            passed += 1
        else:
            failed += 1

        print(f"\n{status}  \"{msg[:45]}\"")
        print(f"   Lang     : {result.language:8}  (expected: {expected_lang})")
        print(f"   Intent   : {result.intent.value:16}  (expected: {expected_intent.value})")
        print(f"   Confidence: {result.confidence:.0%}")
        print(f"   Service  : {route['service']}")
        if result.entities:
            print(f"   Entities : {result.entities}")

    print("\n" + "=" * 65)
    print(f"  RÉSULTATS: {passed}/{total} passés  |  {failed} échoués")
    accuracy = (passed / total) * 100
    print(f"  Précision: {accuracy:.1f}%")
    print("=" * 65)

    # Tests entities
    print("\n--- TEST ENTITY EXTRACTION ---")
    entity_tests = [
        "programme de 5 jours pour débutant",
        "3tini exercice l sder, 80kg",
        "je pèse 75 kg et je veux maigrir",
        "workout for legs advanced level",
    ]
    for msg in entity_tests:
        result = classify_intent(msg)
        print(f"\n  \"{msg}\"")
        print(f"  entities → {result.entities}")


if __name__ == "__main__":
    run_tests()