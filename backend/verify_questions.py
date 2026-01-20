from question_bank import QUESTION_BANK

# Verify question-answer mappings
print("Verifying first 10 questions...")
for q in QUESTION_BANK[:10]:
    qid = q["id"]
    text = q["text"][:50]
    correct_idx = q["correct"]
    correct_answer = q["options"][correct_idx]
    print(f"Q{qid}: {text}... → Answer: {correct_answer} (index {correct_idx})")

print("\n\nChecking for duplicate IDs...")
ids = [q["id"] for q in QUESTION_BANK]
duplicates = [i for i in ids if ids.count(i) > 1]
if duplicates:
    print(f"❌ DUPLICATES FOUND: {set(duplicates)}")
else:
    print("✓ No duplicate IDs")

print(f"\n✓ Total questions: {len(QUESTION_BANK)}")
print(f"✓ ID range: {min(ids)} to {max(ids)}")
