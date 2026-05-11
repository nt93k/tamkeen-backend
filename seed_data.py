"""
Seed Data for Tamkeen
"""
import uuid
from app.database import SessionLocal, engine, Base
from app.models.user import User, StudentProfile, CompanyProfile, UserRole
from app.models.exam import Exam, Question
from app.services.auth_service import hash_password

def seed_db():
    print("Starting data initialization...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Exam).first():
            print("Data already exists. Skipping.")
            return

        print("Creating sample exams...")
        exams_data = [
            {
                "title": "اختبار تأهيل علوم الحاسوب",
                "major": "علوم الحاسوب",
                "description": "اختبار شامل في هياكل البيانات، الخوارزميات، وقواعد البيانات.",
                "questions": [
                    {
                        "text": "ما هي ميزة استخدام 'Binary Search' بدلاً من 'Linear Search'؟",
                        "a": "سهولة البرمجة",
                        "b": "سرعة الأداء في القوائم المرتبة (O(log n))",
                        "c": "تعمل على القوائم غير المرتبة",
                        "d": "لا تتطلب ذاكرة إضافية",
                        "correct": "b",
                        "topic": "الخوارزميات"
                    },
                    {
                        "text": "في SQL، أي أمر يستخدم لاسترجاع البيانات؟",
                        "a": "UPDATE",
                        "b": "DELETE",
                        "c": "SELECT",
                        "d": "INSERT",
                        "correct": "c",
                        "topic": "قواعد البيانات"
                    },
                    {
                        "text": "ما هو الـ 'Stack'؟",
                        "a": "FIFO (First In First Out)",
                        "b": "LIFO (Last In First Out)",
                        "c": "مصفوفة عشوائية",
                        "d": "جدول بيانات",
                        "correct": "b",
                        "topic": "هياكل البيانات"
                    }
                ]
            }
        ]

        for e_info in exams_data:
            exam = Exam(
                title=e_info["title"],
                major=e_info["major"],
                description=e_info["description"]
            )
            db.add(exam)
            db.flush()

            for i, q_info in enumerate(e_info["questions"]):
                question = Question(
                    exam_id=exam.id,
                    question_text=q_info["text"],
                    option_a=q_info["a"],
                    option_b=q_info["b"],
                    option_c=q_info["c"],
                    option_d=q_info["d"],
                    correct_option=q_info["correct"],
                    topic=q_info["topic"],
                    order_num=i
                )
                db.add(question)

        print("Creating test company...")
        company_user = User(
            email="hr@tamkeen.iq",
            hashed_password=hash_password("password123"),
            role=UserRole.company
        )
        db.add(company_user)
        db.flush()

        company_profile = CompanyProfile(
            user_id=company_user.id,
            company_name="تمكين للحلول التقنية",
            industry="تكنولوجيا المعلومات",
            province="بغداد",
            description="شركة رائدة في مجال حلول الذكاء الاصطناعي."
        )
        db.add(company_profile)

        db.commit()
        print("Initialization completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during initialization: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
