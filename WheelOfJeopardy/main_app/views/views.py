from django.views.generic import CreateView, TemplateView
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate

"""
Runs at http://localhost:8000/home/
"""
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
    """

class HomeView(TemplateView):
    template_name = 'home.html'

class CreateUserView(CreateView):
    template_name = 'register.html'
    form_class = UserCreationForm
    success_url = '/'

    def form_valid(self, form):
        valid = super(CreateUserView, self).form_valid(form)
        username, password = form.cleaned_data.get('username'), form.cleaned_data.get('password1')
        new_user = authenticate(username=username, password=password)
        login(self.request, new_user)
        return valid