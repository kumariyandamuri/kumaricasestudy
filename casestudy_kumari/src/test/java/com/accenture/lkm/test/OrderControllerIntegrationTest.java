package com.accenture.lkm.test;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = WebEnvironment.DEFINED_PORT)
public class OrderControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private static final String BASE_URL = "http://localhost:8797/order/controller";

    @Test
    public void testGetOrdersByCustomerId_ValidId_ReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getOrderDetailsByCustomerId/1", String.class);
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        Assertions.assertTrue(String.valueOf(response.getBody()).contains("productName"));
        Assertions.assertTrue(String.valueOf(response.getBody()).contains("customerEmail"));
    }

    @Test
    public void testGetOrdersByCustomerId_InvalidId_ReturnsNotFound() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getOrderDetailsByCustomerId/1001", String.class);
        Assertions.assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    public void testGetOrdersByTypeAndRange_ValidRange_ReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getOrderDetailsByCustomerTypeAndBillInRange/Platinum--30--100",
            String.class);
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    public void testGetOrdersByTypeAndRange_NoResults_ReturnsNotFound() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getOrderDetailsByCustomerTypeAndBillInRange/Platinum--300--1000",
            String.class);
        Assertions.assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}