var zadaci = [];
var api_route = "http://localhost/todoApp-php-js-master/todo-list/api";

function citajZadatke(){
    return $.ajax({
        type: "GET",
        url: api_route + "/get_tasks.php",
        success: (result) => {
            zadaci = JSON.parse(result);
        }
    });
}

//funckija za racunanje uspjesnosti zadataka
//ukoliko je ispod 50% prikazuje se crvenom bojom, ukoliko je iznad zelenom
//ukoliko nemamo zadataka, ne prikazuje se na stranici
//takodje se mijenja na osnovu pretrage i prilagodjava trenutnim rezultatim
function uspjesnost() {
    let brojRijesenih = 0;
    let procenat = 0;

    zadaci.forEach(zadatak => {
        if(zadatak.zavrsen === true) {
            brojRijesenih++;
        }
    })
    procenat = ((brojRijesenih/zadaci.length) * 100).toFixed(2);

    if(procenat<50) {
        document.getElementById("uspesnost").style.color = "red";
    } else {
        document.getElementById("uspesnost").style.color = "green";
    }
    if(zadaci.length == 0) {
        document.getElementById('uspesnost').innerHTML = '';
    } else {
        document.getElementById('uspesnost').innerHTML = '<h6>Uspjesnost: '+procenat+'%</h6>';
    }
}

function prikaziZadatke(){
    // let tabela_body = document.getElementById('tabela_svih_body');
    document.getElementById('broj-zadataka').innerHTML = '<h6>Broj zadataka: '+zadaci.length+'</h6>';
    let tabela_body = $('#tabela_svih_body');
    let tabela = [];
    zadaci.forEach( (zadatak, i) => {

        let zavrseno_chk = '';
        let klasa_zavrseno = '';
        if(zadatak.zavrsen){
            zavrseno_chk = 'checked';
            klasa_zavrseno = 'zavrseno';
        }
        let chk_box = `<input type="checkbox" onchange="zavrsiZadatak(${i})" ${zavrseno_chk} />`;
        let dugme_brisanje = `<button class="btn btn-sm btn-danger " onclick="ukloniZadatak(${zadatak.id})" ><i class="fa fa-times"></i></button>`;
        let dugme_izmjena = `<button class="btn btn-sm btn-primary " onclick="izmijeniZadatak(${i})" ><i class="fa fa-edit"></i></button>`;
        tabela.push(`<tr id="red_${i}" class="${klasa_zavrseno}" > <td>${zadatak.id}</td><td>${zadatak.tekst}</td><td>${zadatak.opis}</td> <td>${chk_box}</td> <td>${dugme_brisanje} ${dugme_izmjena}</td> </tr>`);
    });

    uspjesnost();
    tabela_body.html(tabela.join(''));
}

function generisiNoviID(){
    let max = 0;
    for(let i = 0; i < zadaci.length; i++){
        if(zadaci[i].id > max) max = zadaci[i].id;
    }
    return max+1;
}

function zavrsiZadatak(index){
    zadaci[index].zavrsen = !(zadaci[index].zavrsen);
    $.ajax({ 
        type: "POST",
        url: api_route + '/complete_task.php',
        data: { index: index, status: (zadaci[index].zavrsen) },
        success: (response) => {
            $('#red_'+index).toggleClass('zavrseno');
            uspjesnost();
        }
    });

}

//funckija za brisanje zadatka
//ukoliko smo uspjesno izbrisali zadatak, prikaze se poruka da je zadatak uspjesno uklonjen i ukloni se nakon par sekundi
//ukoliko nismo, prikazujemo u alertu odgovarajucu poruku sa back-a
function ukloniZadatak(index){
    if(confirm("Da li ste sigurni?")){
        $.ajax({
            type: "POST",
            url: api_route + '/delete_task.php',
            data: { id: index },
            success: (response) => {
                document.getElementById("poruka-uspjesno").style.display = "block";
                if(response == "OK") {
                    document.getElementById('poruka-uspjesno').innerHTML = "<div class='col-12 alert alert-success text-center'> Zadatak uspjesno uklonjen! </div>"
                    $('#poruka-uspjesno').delay(1000).hide(500);
                    citajZadatke().then( () => {
                        prikaziZadatke();
                    });
                } else {
                    alert(response);
                }
            }
        });
    }
}

function izmijeniZadatak(index){
    let zadatak = zadaci[index];
    document.getElementById('izmjena_tekst').value = zadatak.tekst;
    document.getElementById('izmjena_opis').value = zadatak.opis;
    document.getElementById('id_izmjena').value = zadatak.id;
    $("#modal_izmjena").modal('show');
}

function isprazniPolja(tip){
    if(tip == 'izmjena'){
        document.getElementById('izmjena_tekst').value = "";
        document.getElementById('izmjena_opis').value = "";
        document.getElementById('index_izmjena').value = -1;
    }else if(tip == 'dodavanje'){
        document.getElementById('novi_zadatak_tekst').value = "";
        document.getElementById('novi_zadatak_opis').value = ""; 
    }
}

citajZadatke().then( () => {
    prikaziZadatke();
});

// dodavanje event listener-a
document.getElementById('dodaj_novi_forma').addEventListener('submit', function(e){
    e.preventDefault();
    let novi_tekst = document.getElementById('novi_zadatak_tekst').value;
    let novi_opis = document.getElementById('novi_zadatak_opis').value;
    let novi_zadatak = { id: generisiNoviID(), tekst: novi_tekst, opis: novi_opis, zavrsen: false };

    $.ajax({
        type: "POST",
        url: api_route + '/add_task.php',
        data: novi_zadatak,
        success: (result) => {
            document.getElementById("poruka-uspjesno").style.display = "block";
            if(result == "OK"){
                zadaci.push(novi_zadatak);
                prikaziZadatke();
                $("#modal_dodavanje").modal('hide');
                isprazniPolja('dodavanje');
                document.getElementById('poruka-uspjesno').innerHTML = "<div class='col-12 alert alert-success text-center'> Zadatak uspjesno dodat! </div>"
                $('#poruka-uspjesno').delay(1000).hide(500);
            }else{
                alert(result);
            }
        }    
    });

});


//event listener za izmjenu zadatka
//pokupimo vrijednosti koje saljemo na server za izmjenu i ako je sve proslo  uspjesno prikaze se odgovarajuca poruka
//ukoliko je doslo do greske, prikazuje se alert sa odgovarajucom porukom sa back-a
document.getElementById('izmjena_zadatka_forma').addEventListener('submit', function(e){
    e.preventDefault();

    tekst = document.getElementById('izmjena_tekst').value;
    opis = document.getElementById('izmjena_opis').value;
    id = document.getElementById('id_izmjena').value;

    $.ajax({
        type: "POST",
        url: api_route + '/edit_task.php',
        data: { id: id, tekst: tekst, opis: opis },
        success: (result) => {
            document.getElementById("poruka-uspjesno").style.display = "block";
            if(result == "OK"){
                $("#modal_izmjena").modal('hide');
                isprazniPolja('izmjena');
                citajZadatke().then( () => {
                    prikaziZadatke();
                });
                document.getElementById('poruka-uspjesno').innerHTML = "<div class='col-12 alert alert-success text-center'> Zadatak uspjesno izmjenjen! </div>"
                $('#poruka-uspjesno').delay(1000).hide(500);
            }else{
                alert(result);
            }
        }
    });

});

//postavljena live pretraga (radi lakseg testiranja)
//nije efikasno jer u slucaju ogromnog broja zadataka, dolazilo bi do stalnih zahtjeva prema serveru i bilo bi dosta sporo
document.getElementById('pretraga_form').addEventListener('keyup', function(e){
   pretraga();
});

document.getElementById('pretraga_zavrsen').addEventListener('change', function(e){
    pretraga();
});

//pokupimo potrebne vrijednosti koje saljemo na server, posaljemo ih i kao odgovor dobijemo json sa odgovarajucim podacima koje prikazemo
function pretraga() {
    var filterZadaci = [];

    tekst = document.getElementById('pretraga_tekst').value;
    opis = document.getElementById('pretraga_opis').value;
    zavrsen = document.getElementById('pretraga_zavrsen').value;

    $.ajax({
        type: "GET",
        url: api_route + '/search_tasks.php',
        data: { tekst: tekst, opis: opis, zavrsen: zavrsen },
        success: (result) => {
            zadaci = JSON.parse(result);
            console.log(zadaci);
            prikaziZadatke()
        }
    });
}

//funckija koja se koristi da se isprazne vrijednosti pretrage
function ocistiPretragu() {
    document.getElementById('pretraga_tekst').value = "";
    document.getElementById('pretraga_opis').value = "";
    document.getElementById('pretraga_zavrsen').value = "";
}