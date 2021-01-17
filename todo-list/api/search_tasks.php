<?php

    //prevelik metod za pretragu, bolji nacin je raditi filter u js koji ce da trazi rezultate od vec dobijenog niza elemenata
    //ali posto radimo back, uradjeno je na ovaj nacin kako bi preko servera vratili samo zeljene rezultate
    //pretraga funkcionise tako da trazi rezultate na osnovu 3 kriterijuma
    //ukoliko su popunjena sva 3 kriterijuma, vratice samo one rezultate koji ispunjavaju sva 3 kriterijuma
    //isto tako, ukoliko su popunjena 2 ili samo jedan, vractice samo one koji ispunjavaju sve sto je popunjeno
    //ukoliko su svi kriterijumi prazni, vraca sve elemente niza

    if($_SERVER['REQUEST_METHOD'] == "GET") {

        $todos = json_decode( file_get_contents('../todo.db'), true );
        $to_show = [];

        $tekst = $_GET['tekst'];
        $opis = $_GET['opis'];
        $zavrsen = $_GET['zavrsen'];

        if($tekst == "" && $opis == "" && $zavrsen == "") {
            $to_show = $todos;
            print_r(json_encode($to_show));
        } else if($tekst == "" && $opis == "") {
            foreach($todos as $todo){
                if( $zavrsen == 1 ){
                    if($todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                }else if($zavrsen == 0){
                    if(!$todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if($zavrsen == 2) {
                    $to_show = $todos;
                }
            }
            print_r(json_encode($to_show));
        } else if($tekst == "" && $zavrsen == "") {
            foreach($todos as $todo){
                if( stripos($todo['opis'], $opis) !== FALSE ){
                    $to_show[] = $todo;
                }
            }
            print_r(json_encode($to_show));
        } else if($tekst == "") {
            foreach ($todos as $todo) {
                if(stripos($todo['opis'], $opis) !== FALSE && $zavrsen == 0) {
                    if(!$todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if(stripos($todo['opis'], $opis) !== FALSE && $zavrsen == 1) {
                    if($todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if(stripos($todo['opis'], $opis) !== FALSE && $zavrsen == 2) {
                    $to_show[] = $todo;
                }
            }
            print_r(json_encode($to_show));
        } else if($opis == "" && $zavrsen == "") {
            foreach($todos as $todo){
                if( stripos($todo['tekst'], $_GET['tekst']) !== FALSE ){
                    $to_show[] = $todo;
                }
            }
            print_r(json_encode($to_show));
        } else if($opis == "") {
            foreach ($todos as $todo) {
                if(stripos($todo['tekst'], $tekst) !== FALSE && $zavrsen == 0) {
                    if(!$todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if(stripos($todo['tekst'], $tekst) !== FALSE && $zavrsen == 1) {
                    if($todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if(stripos($todo['tekst'], $tekst) !== FALSE && $zavrsen == 2) {
                    $to_show[] = $todo;
                }
            }
            print_r(json_encode($to_show));
        } else if($zavrsen == "") {
            foreach($todos as $todo){
                if( stripos($todo['tekst'], $_GET['tekst']) !== FALSE && stripos($todo['opis'], $_GET['opis']) !== FALSE){
                    $to_show[] = $todo;
                }
            }
            print_r(json_encode($to_show));
        } else if($tekst != "" && $opis != "" && $zavrsen != "" ) {
            foreach($todos as $todo){
                if( stripos($todo['tekst'], $_GET['tekst']) !== FALSE && stripos($todo['opis'], $_GET['opis']) !== FALSE && $zavrsen == 0){
                    if(!$todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if(stripos($todo['tekst'], $_GET['tekst']) !== FALSE && stripos($todo['opis'], $_GET['opis']) !== FALSE && $zavrsen == 1){
                    if($todo['zavrsen']){
                        $to_show[] = $todo;
                    }
                } else if(stripos($todo['tekst'], $_GET['tekst']) !== FALSE && stripos($todo['opis'], $_GET['opis']) !== FALSE && $zavrsen == 2) {
                    $to_show[] = $todo;
                }
            }
            print_r(json_encode($to_show));
        } else {
            exit("Greska prilikom pretrage!");
        }
    } else {
        $e = new Exception('Method Not Allowed', 405);
        echo '<h1>'.$e->getCode().' '.$e->getMessage().'</h1>';
    }


