# ADR: BudzetApp

Aplikacja to planer budżetu w modelu kopertowym. Na początku miesiąca dzielę pieniądze na koperty (kategorie), a w trakcie miesiąca aktualizuję, ile w każdej już wydałem.

## ADR-1: Koperta jako jedna kwota, bez tabeli transakcji

| Pole | Treść |
|---|---|
| **Decyzja** | Wydatki w kopercie trzymam jako jedną kwotę `spent`, a nie listę pojedynczych transakcji. Wszystkie kwoty to `Numeric(10,2)`, czyli w Pythonie `Decimal`. |
| **Kontekst** | Musiałem zdecydować, czym jest aplikacja: planerem (ile mi zostało w kopercie) czy trackerem (na co poszły pieniądze). Wybrałem planer. |
| **Alternatywy** | Osobna tabela transakcji, a `spent` liczone jako ich suma. Trzymanie kwot jako `float`. |
| **Uzasadnienie** | Planer kopertowy działa dlatego, że nie wpisuje się każdego paragonu. Tracker wymagałby ciągłego dodawania transakcji, czyli żmudnej pracy, skutkującej porzuceniem budżetowania pieniędzy. Wystarczy mi jedna kwota, którą się koryguje. `Numeric` zamiast `float`, bo aplikacja w kółko dodaje i odejmuje pieniądze, a `float` gubi grosze (0.1 + 0.2 nie daje równo 0.3). |
| **Trade-offy** | <ul><li>(+) Prosty model i szybkie zapytania: miesiąc to kilka kopert, a nie setki transakcji do sumowania.</li><li>(+) Kwoty dokładne dzięki `Numeric`.</li><li>(-) Tracę historię pojedynczych wydatków, mogę poprawić tylko sumę w kopercie, nie cofnąć jednego zakupu.</li><li>(-) Przejście na tracker wymagałoby dodania tabeli transakcji.</li></ul> |

## ADR-2: FastAPI jako backend

| Pole | Treść |
|---|---|
| **Decyzja** | Backend piszę w Pythonie z FastAPI. |
| **Kontekst** | Potrzebuję REST API z logowaniem i czterema zasobami. Backend to głównie CRUD plus liczenie podsumowania miesiąca. Framework ma przede wszystkim nie przeszkadzać. |
| **Alternatywy** | Django + DRF (dużo gotowych rzeczy w pakiecie). Node z Express albo Nest (ten sam język co frontend). |
| **Uzasadnienie** | Najlepiej znam Pythona, więc w nim zrobię to najszybciej. FastAPI dodatkowo sam sprawdza dane wchodzące do API (czy email jest emailem, czy kwota nie jest ujemna) i sam tworzy stronę z dokumentacją API (Swagger). W innych frameworkach musiałbym to dopisać ręcznie. Django odrzuciłem, bo ma dużo gotowych funkcji (panel admina, użytkownicy), z których prawie nic bym tu nie wykorzystał. |
| **Trade-offy** | <ul><li>(+) Walidacja danych i dokumentacja API (Swagger) za darmo, bez pisania ich ręcznie.</li><li>(+) Piszę w języku, który znam najlepiej, więc szybciej.</li><li>(-) Nie mam wspólnego języka z frontendem, więc typy odpowiedzi API opisuję drugi raz ręcznie w TypeScripcie.</li><li>(-) FastAPI nie narzuca struktury projektu, więc podział na routery, schematy i modele umowny.</li></ul> |

## ADR-3: PostgreSQL z SQLAlchemy i Alembic

| Pole | Treść |
|---|---|
| **Decyzja** | Baza to PostgreSQL 16, dostęp przez SQLAlchemy, a zmiany schematu wersjonuję Alembikiem (narzędzie do migracji). |
| **Kontekst** | Dane są relacyjne: użytkownik ma miesiące, miesiąc ma koperty, koperta wskazuje kategorię. Chcę też, żeby baza pilnowała dwóch reguł: jeden miesiąc na dany okres u użytkownika i jedna koperta na kategorię w danym miesiącu. |
| **Alternatywy** | SQLite (baza w jednym pliku, zero konfiguracji). MongoDB (baza dokumentowa, odpada, bo dane są relacyjne). |
| **Uzasadnienie** | W ADR-1 zdecydowałem, że kwoty mają być dokładne (`Numeric`/`Decimal`). PostgreSQL ma prawdziwy typ dziesiętny i trzyma 1500.50 co do grosza. SQLite takiego typu nie ma, liczby z przecinkiem zapisuje jako `float`, więc na SQLite wróciłby problem zaokrągleń, który odrzuciłem w ADR-1. Obie reguły z Kontekstu wymuszam zwykłym `UNIQUE`, więc błędne dane nie zapiszą się nawet przy błędzie w kodzie. Alembic, bo to naturalne narzędzie do migracji dla SQLAlchemy. |
| **Trade-offy** | <ul><li>(+) Kwoty dokładne (`NUMERIC`), a spójność danych pilnuje baza (`UNIQUE`), nie kod.</li><li>(+) Migracje wersjonowane Alembikiem, gotowe pod przyszłe zmiany schematu.</li><li>(-) Bez Dockera lokalne uruchomienie jest trudniejsze, bo bazę trzeba postawić osobno (z SQLite nie trzeba).

## ADR-4: REST zamiast GraphQL czy tRPC

| Pole | Treść |
|---|---|
| **Decyzja** | API to zwykły REST z zasobami `/auth`, `/categories`, `/months`, `/envelopes`. |
| **Kontekst** | Frontend ma jeden główny widok (miesiąc z kopertami i podsumowaniem) plus kategorie i logowanie. Widoków jest mało i ich potrzeby się nie zmieniają. |
| **Alternatywy** | GraphQL (frontend sam wybiera, które pola chce dostać). tRPC (automatycznie współdzieli typy między frontem a backendem, ale wymaga TypeScriptu po obu stronach, a backend mam w Pythonie). |
| **Uzasadnienie** | Przy czterech zasobach REST to najprostszy standard i w zupełności wystarcza. FastAPI generuje do niego gotową dokumentację. Jedyny ekran, który potrzebuje danych z kilku tabel naraz (podsumowanie miesiąca), dostał własny endpoint i nie musiałem do tego dokładać GraphQL. |
| **Trade-offy** | <ul><li>(+) Czytelny, standardowy kontrakt i darmowa dokumentacja (Swagger).</li><li>(+) Naturalne kody odpowiedzi (200, 401, 404, 409) i prosta walidacja wejścia.</li><li>(-) Kształt danych API opisuję w dwóch miejscach osobno: po stronie Pythona i w TypeScripcie na froncie. Nic nie pilnuje, żeby się zgadzały, więc jak zmienię jedno i zapomnę o drugim, błąd wyjdzie dopiero przy działaniu aplikacji.</li></ul> |

## ADR-5: JWT zamiast sesji w cookie

| Pole | Treść |
|---|---|
| **Decyzja** | Logowanie zwraca token JWT (ważny 24h). Frontend trzyma go w localStorage i wysyła w nagłówku `Authorization: Bearer`. |
| **Kontekst** | Frontend i API to osobne kontenery i osobne adresy (port 5173 i 8000). Chronione endpointy muszą rozpoznać użytkownika. |
| **Alternatywy** | Sesje w cookie (przy dwóch różnych adresach wymagają dodatkowej konfiguracji CORS i ochrony przed CSRF). Logowanie przez zewnętrznego dostawcę, np. Google (OAuth). |
| **Uzasadnienie** | Token w nagłówku jest bezstanowy: backend nie trzyma żadnych sesji, tylko sprawdza podpis tokenu. Front i back to osobne adresy, a token w nagłówku działa między nimi bez kombinowania z ciasteczkami i CSRF. FastAPI ma to gotowe (`OAuth2PasswordBearer`), więc ochrona endpointu to jedna linijka. Logowania przez Google nie wziąłem nie dlatego, że jest złe, tylko że uzależnia logowanie od zewnętrznej firmy i dokłada konfigurację, a chciałem mieć całe uwierzytelnianie u siebie i móc je w całości wytłumaczyć. Hasła trzymam jako hash bcrypt, nigdy jawnie. |
| **Trade-offy** | <ul><li>(+) Bezstanowo i prosto: backend nie utrzymuje sesji, a ochrona endpointu to jedna zależność.</li><li>(+) Działa czysto między osobnymi adresami frontu i API.</li><li>(-) localStorage jest dostępny dla JavaScriptu, więc atak XSS oznaczałby kradzież tokenu (cookie httpOnly byłoby bezpieczniejsze).</li><li>(-) Tokenu nie da się unieważnić przed upływem 24h, więc nie zrobię opcji "wyloguj wszędzie". Na skalę tego projektu to akceptuję.</li></ul> |

## ADR-6: React SPA bez biblioteki do stanu

| Pole | Treść |
|---|---|
| **Decyzja** | Frontend to SPA w React z Vite i TypeScriptem. Routing przez react-router, zapytania do API przez własny mały wrapper na `fetch`, stan logowania w jednym Contexcie. Bez Reduxa, Zustanda czy TanStack Query. |
| **Kontekst** | Aplikacja ma trzy strony (logowanie, rejestracja, widok miesiąca). Wszystko kręci się wokół jednego widoku, dane nie są współdzielone po całym drzewie komponentów. |
| **Alternatywy** | Next.js (renderowanie po stronie serwera, ale cała treść jest za logowaniem, więc nic by nie dało). TanStack Query (biblioteka do cache'owania danych z serwera). |
| **Uzasadnienie** | Chciałem, żeby liczba bibliotek odpowiadała skali aplikacji. Mój wrapper `request()` w jednym pliku dokleja token i obsługuje błędy, a po każdej zmianie po prostu pobieram miesiąc jeszcze raz. Przy jednym widoku to wystarcza za całe zarządzanie stanem. Vite zamiast Next, bo buduję zwykłą SPA serwowaną przez nginx. |
| **Trade-offy** | <ul><li>(+) Mało zależności i mniej kodu, łatwiej ogarnąć całość.</li><li>(+) Po każdej zmianie pobieram dane od nowa, bez ręcznego pilnowania cache.</li><li>(-) Ręczny `fetch` znaczy, że ładowanie i błędy obsługuję w każdej stronie osobno i łatwo o niespójność.</li><li>(-) Gdyby doszedł drugi widok na tych samych danych, zacząłbym dublować zapytania i wtedy TanStack Query miałby sens.</li></ul> |

## ADR-7: docker-compose z trzema serwisami

| Pole | Treść |
|---|---|
| **Decyzja** | Trzy kontenery: baza (postgres:16), API (uvicorn) i frontend (build w Node, gotowe pliki serwuje nginx). Migracje Alembica uruchamiają się same przy starcie kontenera API. |
| **Kontekst** | Wymóg projektu: cały stack ma wstać jedną komendą. Trzeba było rozwiązać dwie rzeczy: co zrobić z frontendem w kontenerze i kto doprowadza bazę do aktualnego schematu. |
| **Alternatywy** | Frontend jako serwer deweloperski Vite w kontenerze (prostsze, ale to wersja do developmentu, nie do uruchomienia na czysto). Migracje odpalane ręcznie po starcie (łatwo zapomnieć). |
| **Uzasadnienie** | Frontend buduję w Node, a gotowe pliki serwuje lekki nginx, więc obraz końcowy jest mały. Migracje w komendzie startowej plus warunek "czekaj, aż baza będzie gotowa" sprawiają, że `docker compose up` na czystej maszynie kończy się działającą aplikacją bez żadnego ręcznego kroku. |
| **Trade-offy** | <ul><li>(+) `docker compose up` na czystej maszynie daje działającą aplikację bez ręcznych kroków.</li><li>(+) Mały obraz frontendu, bo nginx serwuje gotowy build bez Node.</li><li>(-) Migracje przy każdym starcie wydłużają go o moment, a przy kilku kopiach API mogłyby wejść sobie w drogę (przy jednym kontenerze to nie problem).</li><li>(-) Zmiana w kodzie frontendu wymaga przebudowania obrazu, bo nginx serwuje gotowy build.</li></ul> |
