print("\nKey Entities:")
for ent in doc.ents:
    print(ent.text, ent.label_)