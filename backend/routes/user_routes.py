# user_routes.py: Dashboard statistics, profile editing, theme/language updates, and FAQ AI chatbot
import re
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash
from backend.middleware.auth_middleware import login_required
from backend.utils.db_helper import query_db, execute_query
from backend.services.translation_service import translate

user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    lang = session.get('lang', 'en')

    # Fetch stats
    total = query_db("SELECT COUNT(id) as count FROM complaints WHERE user_id = ?", (user_id,), one=True)['count']
    pending = query_db("SELECT COUNT(id) as count FROM complaints WHERE user_id = ? AND status = 'pending'", (user_id,), one=True)['count']
    in_progress = query_db("SELECT COUNT(id) as count FROM complaints WHERE user_id = ? AND status = 'in_progress'", (user_id,), one=True)['count']
    resolved = query_db("SELECT COUNT(id) as count FROM complaints WHERE user_id = ? AND status = 'resolved'", (user_id,), one=True)['count']
    high_priority = query_db("SELECT COUNT(id) as count FROM complaints WHERE user_id = ? AND (priority = 'high' OR priority = 'critical')", (user_id,), one=True)['count']

    # Fetch recent complaints
    recent_complaints = query_db("""
        SELECT c.*, cat.name_en as cat_en, cat.name_ta as cat_ta
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
        LIMIT 5
    """, (user_id,))

    # Fetch recent notifications
    notifications = query_db("""
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    """, (user_id,))

    stats = {
        'total': total,
        'pending': pending,
        'in_progress': in_progress,
        'resolved': resolved,
        'high_priority': high_priority
    }

    return render_template(
        'user/dashboard.html', 
        stats=stats, 
        recent_complaints=recent_complaints,
        notifications=notifications
    )

@user_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    user_id = session['user_id']
    lang = session.get('lang', 'en')

    if request.method == 'POST':
        name = request.form.get('name')
        mobile = request.form.get('mobile')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Save theme and language preferences as well since we consolidated settings
        theme = request.form.get('theme')
        language = request.form.get('language')

        if not name:
            flash(translate('field_required', lang), 'danger')
            return redirect(url_for('user.profile'))

        if password:
            if password != confirm_password:
                flash(translate('error_match', lang), 'danger')
                return redirect(url_for('user.profile'))
            
            password_hash = generate_password_hash(password)
            execute_query(
                "UPDATE users SET name = ?, mobile = ?, password_hash = ? WHERE id = ?",
                (name, mobile, password_hash, user_id)
            )
        else:
            execute_query(
                "UPDATE users SET name = ?, mobile = ? WHERE id = ?",
                (name, mobile, user_id)
            )

        if theme in ['light', 'dark']:
            session['theme'] = theme
            execute_query("UPDATE users SET theme = ? WHERE id = ?", (theme, user_id))
            
        if language in ['en', 'ta']:
            session['lang'] = language
            execute_query("UPDATE users SET language = ? WHERE id = ?", (language, user_id))

        session['name'] = name
        flash(translate('profile_updated', session.get('lang', 'en')), 'success')
        return redirect(url_for('user.profile'))

    user = query_db("SELECT * FROM users WHERE id = ?", (user_id,), one=True)
    return render_template('user/profile.html', user=user)

@user_bp.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user_id = session['user_id']
    lang = session.get('lang', 'en')

    if request.method == 'POST':
        theme = request.form.get('theme')
        language = request.form.get('language')

        if theme in ['light', 'dark']:
            session['theme'] = theme
            execute_query("UPDATE users SET theme = ? WHERE id = ?", (theme, user_id))
            
        if language in ['en', 'ta']:
            session['lang'] = language
            execute_query("UPDATE users SET language = ? WHERE id = ?", (language, user_id))

        flash(translate('settings_updated', session.get('lang', 'en')), 'success')
        return redirect(url_for('user.settings'))

    user = query_db("SELECT theme, language FROM users WHERE id = ?", (user_id,), one=True)
    return render_template('user/settings.html', user=user)

@user_bp.route('/feedback')
@login_required
def feedback_form():
    complaint_id = request.args.get('complaint_id')
    user_id = session['user_id']
    if not complaint_id:
        flash("Ticket ID missing.", "danger")
        return redirect(url_for('user.dashboard'))
    
    complaint = query_db("SELECT * FROM complaints WHERE id = ? AND user_id = ?", (complaint_id, user_id), one=True)
    if not complaint:
        flash("Ticket not found or unauthorized.", "danger")
        return redirect(url_for('user.dashboard'))
        
    return render_template('user/feedback.html', complaint=complaint)

@user_bp.route('/api/theme_lang', methods=['POST'])
@user_bp.route('/api_theme_lang', methods=['POST'])
def api_theme_lang():
    data = request.get_json() or {}
    theme = data.get('theme')
    lang = data.get('lang')
    
    if theme in ['light', 'dark']:
        session['theme'] = theme
        if 'user_id' in session:
            execute_query("UPDATE users SET theme = ? WHERE id = ?", (theme, session['user_id']))
            
    if lang in ['en', 'ta']:
        session['lang'] = lang
        if 'user_id' in session:
            execute_query("UPDATE users SET language = ? WHERE id = ?", (lang, session['user_id']))

    return jsonify({'status': 'success', 'theme': session.get('theme'), 'lang': session.get('lang')})

@user_bp.route('/chatbot')
@login_required
def chatbot():
    return render_template('user/chatbot.html')

@user_bp.route('/chatbot/query', methods=['POST'])
@user_bp.route('/api/chatbot', methods=['POST'])
@login_required
def chatbot_query():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    lang = session.get('lang', 'en')

    if not message:
        return jsonify({'response': 'Please enter a question.'})

    message_lower = message.lower()
    
    # 1. Search for Ticket IDs in message
    ticket_match = re.search(r'tkt-\d{6}', message_lower)
    if ticket_match:
        ticket_id = ticket_match.group(0).upper()
        # Query database
        ticket = query_db("""
            SELECT c.*, cat.name_en as cat_en, cat.name_ta as cat_ta
            FROM complaints c
            JOIN categories cat ON c.category_id = cat.id
            WHERE c.ticket_id = ?
        """, (ticket_id,), one=True)
        
        if ticket:
            # Check ownership (unless admin)
            if session.get('role') != 'admin' and ticket['user_id'] != session['user_id']:
                response = "You are not authorized to track this ticket." if lang == 'en' else "இந்த டிக்கெட்டை கண்காணிக்க உங்களுக்கு அனுமதி இல்லை."
            else:
                status_capitalized = ticket['status'].replace('_', ' ').capitalize()
                priority_capitalized = ticket['priority'].capitalize()
                cat_name = ticket['cat_en'] if lang == 'en' else ticket['cat_ta']
                
                if lang == 'en':
                    response = f"Ticket Found! Here is the current status of **{ticket_id}**:<br>" \
                               f"• **Subject:** {ticket['title']}<br>" \
                               f"• **Category:** {cat_name}<br>" \
                               f"• **Priority:** {priority_capitalized}<br>" \
                               f"• **Current Status:** <span class='badge bg-info'>{status_capitalized}</span><br>" \
                               f"• **Submitted on:** {ticket['created_at']}"
                else:
                    response = f"டிக்கெட் கண்டறியப்பட்டது! **{ticket_id}** இன் தற்போதைய நிலை:<br>" \
                               f"• **பொருள்:** {ticket['title']}<br>" \
                               f"• **வகை:** {cat_name}<br>" \
                               f"• **முன்னுரிமை:** {priority_capitalized}<br>" \
                               f"• **தற்போதைய நிலை:** <span class='badge bg-info'>{status_capitalized}</span><br>" \
                               f"• **சமர்ப்பிக்கப்பட்ட தேதி:** {ticket['created_at']}"
        else:
            response = f"I searched the database but could not find a ticket with ID **{ticket_id}**." if lang == 'en' \
                else f"வங்கி தரவுத்தளத்தில் **{ticket_id}** என்ற ஐடி கொண்ட டிக்கெட்டை என்னால் கண்டுபிடிக்க முடியவில்லை."
        return jsonify({'response': response})

    # 2. General FAQ Matches
    if any(k in message_lower for k in ['help', 'guide', 'submit', 'complaint', 'how to', 'புகார்', 'உதவி']):
        if lang == 'en':
            response = "To submit a new complaint, click on **Submit Complaint** in the sidebar. Describe your issue, choose a category, and upload a document if needed. The AI engine will automatically scan your text and suggest category/priority levels."
        else:
            response = "புதிய புகாரைச் சமர்ப்பிக்க, பக்கவாட்டுப் பட்டியில் உள்ள **புகாரைச் சமர்ப்பி** என்பதைக் கிளிக் செய்யவும். உங்கள் சிக்கலை விவரித்து, ஒரு வகையைத் தேர்வு செய்யவும். தேவைப்பட்டால் ஆவணங்களைப் பதிவேற்றலாம். AI இன்ஜின் உங்கள் உரையை ஸ்கேன் செய்து வகை/முன்னுரிமைகளை பரிந்துரைக்கும்."
            
    elif any(k in message_lower for k in ['category', 'categories', 'வகை', 'வகைகள்']):
        if lang == 'en':
            response = "We support 5 support categories:<br>" \
                       "1. **Payment/Billing**: Issues with charges or refunds.<br>" \
                       "2. **Technical Support**: Software issues and bugs.<br>" \
                       "3. **Account Access**: Profile lockouts and password resets.<br>" \
                       "4. **Shipping/Delivery**: Dispatch delays and tracking.<br>" \
                       "5. **Customer Service**: Feedback on support agent quality."
        else:
            response = "நாங்கள் 5 ஆதரவு வகைகளை ஆதரிக்கிறோம்:<br>" \
                       "1. **கட்டணம் மற்றும் பில்லிங்**: பரிவர்த்தனைகள் அல்லது பணம் திரும்பப் பெறுதல்.<br>" \
                       "2. **தொழில்நுட்ப ஆதரவு**: மென்பொருள் சிக்கல்கள் மற்றும் பிழைகள்.<br>" \
                       "3. **கணக்கு அணுகல்**: சுயவிவர முடக்கம் மற்றும் கடவுச்சொல் மீட்டமைப்பு.<br>" \
                       "4. **கப்பல் மற்றும் விநியோகம்**: தாமதங்கள் மற்றும் பார்சல் டிராக்.<br>" \
                       "5. **வாடிக்கையாளர் சேவை**: முகவர்கள் பற்றிய கருத்துக்கள்."
                       
    elif any(k in message_lower for k in ['time', 'duration', 'long', 'days', 'நேரம்', 'தாமதம்']):
        if lang == 'en':
            response = "Average resolution timeframes depend on ticket priority:<br>" \
                       "• **Critical**: Under 4 hours.<br>" \
                       "• **High**: Under 24 hours.<br>" \
                       "• **Medium**: 2 to 3 business days.<br>" \
                       "• **Low**: 3 to 5 business days."
        else:
            response = "சராசரி தீர்வு காலவரம்புகள் டிக்கெட் முன்னுரிமையைப் பொறுத்தது:<br>" \
                       "• **மிக முக்கிய (Critical)**: 4 மணி நேரத்திற்குள்.<br>" \
                       "• **உயர் (High)**: 24 மணி நேரத்திற்குள்.<br>" \
                       "• **நடுத்தர (Medium)**: 2 முதல் 3 வேலை நாட்கள்.<br>" \
                       "• **குறைந்த (Low)**: 3 முதல் 5 வேலை நாட்கள்."
                       
    elif any(k in message_lower for k in ['track', 'status', 'கண்காணிப்பு', 'நிலை']):
        if lang == 'en':
            response = "To track a ticket, please type **track** followed by your Ticket ID. For example: **track TKT-100201**"
        else:
            response = "டிக்கெட்டைக் கண்காணிக்க, தயவுசெய்து **track** மற்றும் உங்கள் டிக்கெட் ஐடியை உள்ளிடவும். உதாரணமாக: **track TKT-100201**"
            
    else:
        if lang == 'en':
            response = "Hello! I am your FAQ support assistant. You can ask me:<br>" \
                       "• How to submit a complaint?<br>" \
                       "• What are the support categories?<br>" \
                       "• What is the resolution timeframe?<br>" \
                       "• Or enter a Ticket ID to track it (e.g. **track TKT-100201**)."
        else:
            response = "வணக்கம்! நான் உங்கள் உதவி முகவர். நீங்கள் என்னிடம் கேட்கலாம்:<br>" \
                       "• புகாரை எவ்வாறு சமர்ப்பிப்பது?<br>" \
                       "• ஆதரவு வகைகள் யாவை?<br>" \
                       "• தீர்வுக்கான கால அளவு என்ன?<br>" \
                       "• அல்லது கண்காணிக்க டிக்கெட் ஐடியை உள்ளிடவும் (எ.கா. **track TKT-100201**)."

    return jsonify({'response': response})
