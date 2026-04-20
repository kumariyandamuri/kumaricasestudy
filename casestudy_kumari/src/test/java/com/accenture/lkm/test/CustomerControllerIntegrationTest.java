package com.accenture.lkm.test;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.accenture.lkm.bean.CustomerBean;

@SpringBootTest(webEnvironment = WebEnvironment.DEFINED_PORT)
public class CustomerControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private static final String BASE_URL = "http://localhost:8797/customer/controller";

    @Test
    public void testGetCustomersByType_Gold_ReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getCustomersByType/Gold", String.class);
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        Assertions.assertTrue(String.valueOf(response.getBody()).contains("Emily Johnson"));
    }

    @Test
    public void testGetCustomersByType_Platinum_ReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getCustomersByType/Platinum", String.class);
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        Assertions.assertFalse(String.valueOf(response.getBody()).contains("John Doe"));
    }

    @Test
    public void testGetCustomersByType_InvalidType_ReturnsNotFound() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            BASE_URL + "/getCustomersByType/Diamond", String.class);
        Assertions.assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    public void testUpdateCustomerType_ValidId_ReturnsOk() {
        CustomerBean customerBean = new CustomerBean();
        customerBean.setCustomerId(3);
        customerBean.setCustomerType("Silver");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CustomerBean> request = new HttpEntity<>(customerBean, headers);
        ResponseEntity<String> response = restTemplate.exchange(
            BASE_URL + "/updateCustomer", HttpMethod.PUT, request, String.class);
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        Assertions.assertTrue(String.valueOf(response.getBody()).contains("updated as Silver successfully"));
    }

    @Test
    public void testUpdateCustomerType_InvalidId_ReturnsServerError() {
        CustomerBean customerBean = new CustomerBean();
        customerBean.setCustomerId(1003);
        customerBean.setCustomerType("Silver");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CustomerBean> request = new HttpEntity<>(customerBean, headers);
        ResponseEntity<String> response = restTemplate.exchange(
            BASE_URL + "/updateCustomer", HttpMethod.PUT, request, String.class);
        Assertions.assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}