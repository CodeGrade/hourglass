package main

import (
	"database/sql"
	"fmt"
	"sync"
	"time"

	_ "github.com/lib/pq"
)

func oneConnection(stop chan bool, mynum int, wg *sync.WaitGroup) {
	defer wg.Done()

	var log = func(str string) {
		fmt.Printf("[%d]\t%s\n", mynum, str)
	}

	var die = func() {
		<-stop
	}

	connStr := "user=hourglass dbname=hourglass_development"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		db.Close()
		log(fmt.Sprintf("failed to open: %s", err))
		die()
		return
	}

	_, err = db.Query("SELECT * FROM users LIMIT(1)")
	if err != nil {
		log(fmt.Sprintf("failed to query: %s", err))
		die()
		return
	} else {
		log("query success")
	}
	<-stop
	err = db.Close()
	if err != nil {
		log(fmt.Sprintf("received signal, error closing connection: %s", err))
		return
	} else {
		log("received signal, closed connection")
	}
}

func main() {
	var chans []chan bool
	var wg sync.WaitGroup

	for i := 1; i <= 95; i++ {
		var our = make(chan bool)
		wg.Add(1)
		go oneConnection(our, i, &wg)
		fmt.Printf("Started connection #%d.\n", i)
		chans = append(chans, our)
	}

	time.Sleep(time.Second * 5)

	for _, ch := range chans {
		ch <- true
	}

	wg.Wait()
}
