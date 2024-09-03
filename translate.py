# from deep_translator import GoogleTranslator

# def translate_to_english(text):
    
#     translator = GoogleTranslator(source='auto', target='en')
#     return translator.translate(text)

# # Get input from the user
# hindi_text = input("Enter Hindi text: ")
# # bengali_text = input("Enter Bengali text: ")

# # Translate the input text to English
# english_text = translate_to_english(hindi_text)
# print(f"Translated Hindi text: {english_text}")

# # english_text = translate_to_english(bengali_text)
# # print(f"Translated Bengali text: {english_text}")

import enchant

def is_english_words(text):
    d = enchant.Dict("en_US")
    words = text.strip().split()
    if sum(d.check(word) for word in words) > 0:
        return 0
    else:
        return 1

eng=is_english_words("से मोबाइल से भेजें हिंदी में टेक्स्ट मैसेज")
print(eng)