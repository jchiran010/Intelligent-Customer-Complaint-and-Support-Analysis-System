# intelligent_service.py: Keyword and rule-based ticket router
import re

# English & Tamil Keyword Dictionaries for Categories
CATEGORY_KEYWORDS = {
    1: [ # Payment/Billing
        'payment', 'billing', 'deducted', 'refund', 'transaction', 'charged', 
        'invoice', 'money', 'cash', 'card', 'subscription', 'renew', 'price',
        'கட்டணம்', 'பணம்', 'பில்லிங்', 'கழிக்கப்பட்டது', 'திரும்ப', 'வங்கி', 'பரிவர்த்தனை'
    ],
    2: [ # Technical Support
        'website', 'app', 'bug', 'crash', 'error', 'slow', 'loading', 'not working', 
        'server', 'failure', 'broken', 'blank screen', 'javascript', 'api',
        'பிழை', 'பழுது', 'வேலை செய்யவில்லை', 'செயலிழப்பு', 'பயன்பாடு', 'சேவையகம்'
    ],
    3: [ # Account Access
        'login', 'password', 'account', 'profile', 'reset', 'pin', 'otp', 'locked', 
        'verify', 'verification', 'credentials', 'sign in',
        'நுழைவு', 'கடவுச்சொல்', 'கணக்கு', 'அணுகல்', 'முடக்கப்பட்டது', 'மீட்டமைக்க'
    ],
    4: [ # Shipping/Delivery
        'shipping', 'delivery', 'courier', 'package', 'delay', 'tracking', 'address', 
        'parcel', 'dispatch', 'transit',
        'அனுப்பப்படவில்லை', 'பார்சல்', 'விநியோகம்', 'முகவரி', 'தாமதம்', 'டிராக்'
    ],
    5: [ # Customer Service
        'staff', 'agent', 'behavior', 'support quality', 'rude', 'unhelpful', 
        'manager', 'feedback', 'service quality',
        'சேவை', 'வாடிக்கையாளர்', 'முகவர்', 'நடத்தை', 'மரியாதை', 'ஆதரவு'
    ]
}

# Priority keywords
PRIORITY_KEYWORDS = {
    'critical': [
        'critical', 'urgent', 'fraud', 'scam', 'cheat', 'hack', 'stolen', 'security breach', 
        'double deducted', 'unauthorized charge', 'மோசடி', 'திருட்டு', 'அபாயகரமான', 'பாதுகாப்பு'
    ],
    'high': [
        'broken', 'fail', 'not working', 'cannot login', 'locked', 'refund request', 
        'error 500', 'blank screen', 'payment failed', 'முடக்கப்பட்டது', 'வேலை செய்யவில்லை'
    ],
    'medium': [
        'slow', 'delay', 'tracking', 'wrong address', 'address update', 'pending delivery',
        'தாமதம்', 'பார்சல்', 'மெதுவாக'
    ]
}

def analyze_complaint(text):
    """
    Analyzes the complaint text using regex & keywords to return suggested category and priority.
    """
    if not text:
        return {
            'category_id': 5, # Customer Service default
            'category_name_en': 'Customer Service',
            'category_name_ta': 'வாடிக்கையாளர் சேவை',
            'priority': 'low',
            'confidence': 0
        }
        
    text_lower = text.lower()
    
    # Category score mapping
    category_scores = {cat_id: 0 for cat_id in CATEGORY_KEYWORDS}
    for cat_id, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            # Check with word boundaries or raw substring matching depending on character type
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower) or kw in text_lower:
                category_scores[cat_id] += 2 if kw in text_lower else 1

    # Get category with highest score
    max_score = max(category_scores.values())
    suggested_category_id = 5  # Default
    if max_score > 0:
        suggested_category_id = max(category_scores, key=category_scores.get)

    # Priority score mapping
    suggested_priority = 'low'
    priority_detected = False
    
    for priority, keywords in PRIORITY_KEYWORDS.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower) or kw in text_lower:
                suggested_priority = priority
                priority_detected = True
                break
        if priority_detected:
            break

    # Resolve category names
    category_names = {
        1: ('Payment/Billing', 'கட்டணம் மற்றும் பில்லிங்'),
        2: ('Technical Support', 'தொழில்நுட்ப ஆதரவு'),
        3: ('Account Access', 'கணக்கு அணுகல்'),
        4: ('Shipping/Delivery', 'கப்பல் மற்றும் விநியோகம்'),
        5: ('Customer Service', 'வாடிக்கையாளர் சேவை')
    }

    cat_en, cat_ta = category_names.get(suggested_category_id, ('Customer Service', 'வாடிக்கையாளர் சேவை'))

    return {
        'category_id': suggested_category_id,
        'category_name_en': cat_en,
        'category_name_ta': cat_ta,
        'priority': suggested_priority,
        'confidence': min(100, int((max_score / 4) * 100)) if max_score > 0 else 20
    }
