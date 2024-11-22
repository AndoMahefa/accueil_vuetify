const FormatDate = function (dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', // Jour de la semaine (ex : "vendredi")
        day: 'numeric',  // Jour du mois (ex : "22")
        month: 'long',   // Mois (ex : "novembre")
        year: 'numeric'  // Année (ex : "2024")
    }).format(date);
}

export default FormatDate;