package com.parksmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParkSmartApplication {
    public static void main(String[] args) {
        SpringApplication.run(ParkSmartApplication.class, args);
    }
}
