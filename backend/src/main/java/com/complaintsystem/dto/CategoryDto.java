package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    @NotNull(message = "SLA hours is required")
    private Integer slaHours;

    private String icon;
    private Boolean isActive;
    private long complaintCount;

    public CategoryDto() {}

    public CategoryDto(Long id, String name, String description, Integer slaHours, String icon, Boolean isActive, long complaintCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.slaHours = slaHours;
        this.icon = icon;
        this.isActive = isActive;
        this.complaintCount = complaintCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSlaHours() { return slaHours; }
    public void setSlaHours(Integer slaHours) { this.slaHours = slaHours; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public long getComplaintCount() { return complaintCount; }
    public void setComplaintCount(long complaintCount) { this.complaintCount = complaintCount; }
}
