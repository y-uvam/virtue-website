import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { type MockCategory, type MockService, dbGet, dbSet } from "../mockData";

interface ServicesState {
  categories: MockCategory[];
  services: MockService[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  categories: [],
  services: [],
  loading: false,
  error: null,
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const fetchCategoriesAndServices = createAsyncThunk(
  "services/fetchAll",
  async (_, { rejectWithValue }) => {
    await delay();
    try {
      const categories = dbGet<MockCategory[]>("smm_categories");
      const services = dbGet<MockService[]>("smm_services");
      
      return {
        categories: categories.filter((c) => c.status === "active"),
        services: services.filter((s) => s.status === "active"),
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch services");
    }
  }
);

// Admin CRUD operations (local storage based)
export const addCategory = createAsyncThunk(
  "services/addCategory",
  async (name: string, { rejectWithValue }) => {
    await delay();
    try {
      const categories = dbGet<MockCategory[]>("smm_categories");
      if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return rejectWithValue("Category name already exists.");
      }
      const newCat: MockCategory = {
        id: `cat-${Math.random().toString(36).substring(2, 9)}`,
        name,
        icon: "globe",
        sort_order: categories.length + 1,
        status: "active",
      };
      categories.push(newCat);
      dbSet("smm_categories", categories);
      return categories;
    } catch (err: any) {
      return rejectWithValue("Failed to add category.");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "services/updateCategory",
  async (category: MockCategory, { rejectWithValue }) => {
    await delay();
    try {
      const categories = dbGet<MockCategory[]>("smm_categories");
      const idx = categories.findIndex((c) => c.id === category.id);
      if (idx === -1) return rejectWithValue("Category not found.");
      categories[idx] = category;
      dbSet("smm_categories", categories);
      return categories;
    } catch (err: any) {
      return rejectWithValue("Failed to update category.");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "services/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    await delay();
    try {
      const categories = dbGet<MockCategory[]>("smm_categories");
      const filtered = categories.filter((c) => c.id !== id);
      dbSet("smm_categories", filtered);
      
      const services = dbGet<MockService[]>("smm_services");
      const cleanServices = services.filter((s) => s.category_id !== id);
      dbSet("smm_services", cleanServices);
      
      return { categories: filtered, services: cleanServices };
    } catch (err: any) {
      return rejectWithValue("Failed to delete category.");
    }
  }
);

export const addService = createAsyncThunk(
  "services/addService",
  async (service: Omit<MockService, "id">, { rejectWithValue }) => {
    await delay();
    try {
      const services = dbGet<MockService[]>("smm_services");
      const newService: MockService = {
        ...service,
        id: `srv-${Math.random().toString(36).substring(2, 9)}`,
      };
      services.push(newService);
      dbSet("smm_services", services);
      return services;
    } catch (err: any) {
      return rejectWithValue("Failed to add service.");
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async (service: MockService, { rejectWithValue }) => {
    await delay();
    try {
      const services = dbGet<MockService[]>("smm_services");
      const idx = services.findIndex((s) => s.id === service.id);
      if (idx === -1) return rejectWithValue("Service not found.");
      services[idx] = service;
      dbSet("smm_services", services);
      return services;
    } catch (err: any) {
      return rejectWithValue("Failed to update service.");
    }
  }
);

export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (id: string, { rejectWithValue }) => {
    await delay();
    try {
      const services = dbGet<MockService[]>("smm_services");
      const filtered = services.filter((s) => s.id !== id);
      dbSet("smm_services", filtered);
      return filtered;
    } catch (err: any) {
      return rejectWithValue("Failed to delete service.");
    }
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesAndServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAndServices.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.services = action.payload.services;
      })
      .addCase(fetchCategoriesAndServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = action.payload.categories.filter((c) => c.status === "active");
        state.services = action.payload.services.filter((s) => s.status === "active");
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories = action.payload.filter((c) => c.status === "active");
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories = action.payload.filter((c) => c.status === "active");
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.services = action.payload.filter((s) => s.status === "active");
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.services = action.payload.filter((s) => s.status === "active");
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = action.payload.filter((s) => s.status === "active");
      });
  },
});

export default servicesSlice.reducer;
