# galilei-web-services

## Premessa

Il progetto mira a sviluppare un'infrastruttura che consenta agli studenti di utilizzare i servizi web in modo rapido e semplice. In particolare, potranno ospitare server, applicazioni/pagine web e database attraverso un'interfaccia utente intuitiva. Ciò consente agli studenti di esporre i propri progetti personali e scolastici su internet senza dover interagire con servizi più complessi.
La realizzazione di questa infrastruttura vuole essere non solo un servizio utile per gli studenti, ma anche un'occasione di apprendimento. Attraverso la gestione e l'utilizzo di questa piattaforma, gli studenti possono acquisire una comprensione più profonda del funzionamento dei servizi web, sviluppare competenze tecniche e acquisire esperienza pratica. Inoltre, questa piattaforma offre agli studenti un ambiente sicuro e controllato per sperimentare, imparare dagli errori e affinare le proprie capacità.

## Servizi principali

### Progetto (Project)

Permette di raggruppare logicamente e fisicamente altri servizi. Ogni progetto crea una rete virtuale interna che blocca il traffico esterno tranne quello esplicitamente richiesto

### Applicazione (App)

Permette di eseguire una qualsiasi applicazione sotto forma di container. Ogni applicazione ha a disposizione due domini dns:

- Publico: che permette di ricevere e instardare il traffico su internet però solo attraverso il protocollo HTTPS che viene implementato su ogni dominio pubblico senza la necessità di implementarlo internamente nel codice dell'app.
- Privato: può ricevere e instradare qualsiasi tipo di traffico verso altre applicazioni che appartengono al suo stesso progetto

### Volume (Volume)

Permette di persistere i dati di un'applicazione in modo tale che essi non vengano eliminati quando i container all'interno di un'app vengono cancellati o riavviati

## Informazioni tecniche

Il progetto presenta le seguanti componenti:

- Database
- Kubernetes cluster
- Backend
- Frontend

### Database

Il database utilizzato è un normale database PostgreSQL, le sue tabelle posso essere trovate nel file file [apps/api/migrations/0001_init.sql](https://github.com/fvckDesa/galilei-web-services/blob/main/apps/api/migrations/0001_init.sql)

### Kubernetes cluster

Il progetto utilizza un cluster kubernetes, più precisamente viene utilizzato [K3s](https://k3s.io/), per la gestione dei container in modo tale che in caso bisogni ospitare molti container si può scalare l'infrastruttura sia verticalmente aumentando le risorse dei vari nodi sia orizzontalmente aggiungendo nuovi nodi al cluster.

All'interno del cluster troviamo due elementi principali:

- Proxy server ([Traefik](https://doc.traefik.io/traefik/)): permette alle applicazioni di esporsi pubblicamente alltraverso il protocollo http
- DNS server ([CoreDNS](https://coredns.io/)): permette alle applicazioni nello stesso progetto di comunicare tra loro
- Certification manager ([cert-manager](https://cert-manager.io/docs/)): gestisce la creazione dei certificati TLS all'interno del cluster, i certificati vengono generati gratuitamenete dalla Certification Authority [Let's Encrypt](https://letsencrypt.org/)

### Backend

Nel backend troviamo una semplice rest api scritta in rust che si occupa di gestire il database e il cluster kubernetes.

### Frontend

Nel frontend troviamo un'applicazione web che utilizza il web framework [Next.js](https://nextjs.org/). La web app cerca di adattarsi il più possibile a qualsiasi tipo di dispositivo permettendo anche la navigazione da schermi più piccoli come quelli dei telefoni
