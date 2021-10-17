from django.shortcuts import render
import requests
from urllib.parse import unquote

"""
Runs at http://localhost:8000/home/
"""
def home(request):

    response = requests.get('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986')
    question = response.json()

    the_question = unquote(question['results'][0]['question'])
    answer = unquote(question['results'][0]['correct_answer'])
   
    return render(
        request, 
        "main_app/home.html", 
        {"question": the_question, "answer": answer}
    )