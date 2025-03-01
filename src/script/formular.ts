import emailjs from '@emailjs/browser';

export function initFormular(
  serviceId: string,
  templateId: string,
  formId: string,
  successId: string,
  errorId: string,
) {
  emailjs.init('SJ0aNKcX728yhsrWb');

  // Získanie formulára
  const form = document.getElementById(formId) as HTMLFormElement;
  const successBox = document.getElementById(successId) as HTMLDivElement;
  const errorBox = document.getElementById(errorId) as HTMLDivElement;

  form.addEventListener('submit', async (event: Event) => {
    event.preventDefault();

    try {
      await emailjs.sendForm(serviceId, templateId, form);
      form.reset(); // Vyčistenie formulára po úspešnom odoslaní
      successBox.style.display = 'block';
      successBox.innerText = 'Ďakujeme, čoskoro Vás budeme kontaktovať.';
      errorBox.innerText = '';
      errorBox.style.display = 'none';
    } catch (error) {
      console.error('Chyba pri odosielaní:', error);
      errorBox.style.display = 'block';
      errorBox.innerText =
        'Pri odoslaní nastala chyba, prosím skúste ešte raz. Pokiaľ chyba pretrváva prosím kontaktujte nás na email: ...';
      successBox.innerText = '';
      successBox.style.display = 'none';
    }
  });
}
