package com.complaintsystem.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.username}")
    private String mysqlUser;

    @Value("${spring.datasource.password}")
    private String mysqlPass;

    @Bean
    @Primary
    public DataSource dataSource() {
        boolean mysqlAvailable = isPortAvailable("localhost", 3306, 1500);

        if (mysqlAvailable) {
            log.info(">>> MySQL instance detected on localhost:3306. Connecting to MySQL database 'complaint_db'...");
            return DataSourceBuilder.create()
                    .driverClassName("com.mysql.cj.jdbc.Driver")
                    .url(mysqlUrl)
                    .username(mysqlUser)
                    .password(mysqlPass)
                    .build();
        } else {
            log.warn(">>> MySQL service was not detected on localhost:3306.");
            log.info(">>> Initializing resilient embedded MySQL-compatible database for immediate operation.");
            log.info(">>> When MySQL is started, the application will automatically connect to MySQL on the next run.");
            return DataSourceBuilder.create()
                    .driverClassName("org.h2.Driver")
                    .url("jdbc:h2:mem:complaint_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
                    .username("sa")
                    .password("")
                    .build();
        }
    }

    private boolean isPortAvailable(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
