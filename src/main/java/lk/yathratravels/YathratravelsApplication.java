package lk.yathratravels;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class YathratravelsApplication {

	public static void main(String[] args) {
		SpringApplication.run(YathratravelsApplication.class, args);

		startMsg();
	}

	public static void startMsg() {
		System.out.println("+++++++++++++++++++++++++++++");
		System.out.println("+++++++++++ Started +++++++++");
		System.out.println("+++++++++++++++++++++++++++++");
	}

}

//go to dev
//git checkout dev

//in dev
//git add .
//git commit -m "Add new feature"
//git push origin dev

//switch to main
//git checkout main

//get latest changes from dev
//git merge dev

//push to remote
//git push origin main

