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
import com.accenture.lkm.bean.ProductBean;

@SpringBootTest(webEnvironment = WebEnvironment.DEFINED_PORT)
public class ProductControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private static final String BASE_URL = "http://localhost:8797/product/controller";

    @Test
    public void testUpdateProductStock_ValidId_ReturnsOk() {
        ProductBean productBean = new ProductBean();
        productBean.setProductId(1);
        productBean.setStock(40);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ProductBean> request = new HttpEntity<>(productBean, headers);
        ResponseEntity<String> response = restTemplate.exchange(
            BASE_URL + "/updateProductStock", HttpMethod.PUT, request, String.class);
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        Assertions.assertTrue(String.valueOf(response.getBody()).contains("Stock updated successfully"));
    }

    @Test
    public void testUpdateProductStock_InvalidId_ReturnsOk() {
        ProductBean productBean = new ProductBean();
        productBean.setProductId(10);
        productBean.setStock(40);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ProductBean> request = new HttpEntity<>(productBean, headers);
        ResponseEntity<String> response = restTemplate.exchange(
            BASE_URL + "/updateProductStock", HttpMethod.PUT, request, String.class);
        Assertions.assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}