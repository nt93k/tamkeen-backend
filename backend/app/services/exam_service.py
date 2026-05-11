"""
خدمة الاختبارات - تصحيح الإجابات وتحليل النتائج
"""
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
import json

from app.models.exam import Exam, Question, ExamResult
from app.models.user import StudentProfile

def get_exam_for_major(db: Session, major: str) -> Optional[Exam]:
    return db.query(Exam).filter(Exam.major == major, Exam.is_active == True).first()

def get_exam_by_id(db: Session, exam_id: str) -> Optional[Exam]:
    return db.query(Exam).filter(Exam.id == exam_id).first()

def score_exam(
    questions: List[Question],
    student_answers: Dict[str, str],
) -> Tuple[float, int, int, List[str]]:
    total = len(questions)
    correct = 0
    topic_stats = defaultdict(lambda: {"total": 0, "correct": 0})

    for question in questions:
        qid = str(question.id)
        student_answer = str(student_answers.get(qid, "")).lower().strip()
        correct_answer = question.correct_option.lower().strip()

        topic_stats[question.topic]["total"] += 1

        if student_answer == correct_answer:
            correct += 1
            topic_stats[question.topic]["correct"] += 1

    score = round((correct / total) * 100, 2) if total > 0 else 0.0
    weak_topics = [
        topic
        for topic, stats in topic_stats.items()
        if stats["total"] > 0 and (stats["correct"] / stats["total"]) < 0.5
    ]

    return score, correct, total, weak_topics

async def submit_exam(db: Session, student_id: str, exam_id: str, answers: Dict[str, str]) -> ExamResult:
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise Exception("Exam not found")
    
    questions = exam.questions
    score, correct, total, weak_topics = score_exam(questions, answers)
    
    passed = score >= exam.pass_threshold
    
    result = ExamResult(
        student_id=student_id,
        exam_id=exam_id,
        score=score,
        passed=passed,
        total_questions=total,
        correct_answers=correct,
        weak_topics=weak_topics,
        answers_json=json.dumps(answers, ensure_ascii=False)
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

def get_all_results_for_student(db: Session, student_id: str) -> List[ExamResult]:
    return db.query(ExamResult).filter(ExamResult.student_id == student_id).order_by(ExamResult.taken_at.desc()).all()
